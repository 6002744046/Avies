import { NextRequest, NextResponse } from "next/server";
import { analyzeHairImages } from "@/lib/ai-analysis";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { createFirebaseAdminDb, FieldValue } from "@/lib/firebase-admin";
import { generateHairSummary } from "@/lib/gemini";
import { buildTreatmentPlan } from "@/lib/recommendations";
import { uploadUserImage } from "@/lib/storage";
import type { AnalysisInput } from "@/lib/types";

export const runtime = "nodejs";

function isValidInput(value: Partial<AnalysisInput>): value is AnalysisInput {
  return Boolean(
    typeof value.age === "number" &&
      value.age >= 16 &&
      value.age <= 90 &&
      ["male", "female", "non_binary", "prefer_not_to_say"].includes(String(value.gender)) &&
      ["early", "moderate", "advanced", "diffuse"].includes(String(value.stage)) &&
      ["under_6_months", "6_12_months", "1_3_years", "3_plus_years"].includes(
        String(value.duration)
      ) &&
      typeof value.familyHistory === "boolean" &&
      Array.isArray(value.lifestyle) &&
      Array.isArray(value.goals)
  );
}

async function parseAnalysisRequest(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const rawInput = formData.get("input");
    const input =
      typeof rawInput === "string" ? (JSON.parse(rawInput) as Partial<AnalysisInput>) : {};
    const photos = formData
      .getAll("photos")
      .filter((item): item is File => item instanceof File && item.size > 0);

    return { input, photos };
  }

  return { input: (await request.json()) as Partial<AnalysisInput>, photos: [] };
}

export async function POST(request: NextRequest) {
  const session = await getCurrentUserFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: "Login is required before AI analysis." }, { status: 401 });
  }

  try {
    const { input, photos } = await parseAnalysisRequest(request);

    if (!isValidInput(input)) {
      return NextResponse.json({ error: "Invalid analysis input." }, { status: 400 });
    }

    const db = createFirebaseAdminDb();
    if (!db) {
      return NextResponse.json({ error: "Firebase Admin database is not configured." }, { status: 503 });
    }

    const uploadedImages = [];
    const visionImages = [];

    for (const photo of photos.slice(0, 4)) {
      const buffer = Buffer.from(await photo.arrayBuffer());
      visionImages.push({ buffer, mimeType: photo.type });
      uploadedImages.push(
        await uploadUserImage({
          file: photo,
          folder: "analysis",
          userId: session.user.uid
        })
      );
    }

    const treatmentPlan = buildTreatmentPlan(input);
    const [aiResult, summary] = await Promise.all([
      analyzeHairImages({ images: visionImages, input }),
      generateHairSummary(input)
    ]);
    const reportRef = await db.collection("analysisReports").add({
      aiResult,
      aiSummary: summary,
      createdAt: FieldValue.serverTimestamp(),
      imageUrls: uploadedImages.map((image) => image.imageUrl),
      images: uploadedImages,
      input,
      riskScore: treatmentPlan.riskScore,
      stage: input.stage,
      treatmentPlan,
      userId: session.user.uid
    });

    const createdAt = new Date().toISOString();
    const analysis = {
      aiResult,
      aiSummary: summary,
      ai_summary: summary,
      createdAt,
      created_at: createdAt,
      id: reportRef.id,
      imageUrls: uploadedImages.map((image) => image.imageUrl),
      input,
      riskScore: treatmentPlan.riskScore,
      risk_score: treatmentPlan.riskScore,
      stage: input.stage,
      treatmentPlan,
      treatment_plan: treatmentPlan,
      userId: session.user.uid,
      user_id: session.user.uid
    };

    return NextResponse.json({ analysis, mode: "firestore" });
  } catch (error) {
    console.error("Analysis route failed", error);
    return NextResponse.json({ error: "Could not generate analysis." }, { status: 500 });
  }
}
