import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest, serializeFirestoreDate } from "@/lib/auth";
import { createFirebaseAdminDb } from "@/lib/firebase-admin";
import { demoAnalysis } from "@/lib/recommendations";
import type { AnalysisInput } from "@/lib/types";

export const runtime = "nodejs";

const fallbackInput: AnalysisInput = {
  age: 31,
  duration: "1_3_years",
  familyHistory: true,
  gender: "male",
  goals: ["regrow_density", "protect_hairline"],
  lifestyle: ["stress", "sleep"],
  stage: "moderate"
};

function mapAnalysis(id: string, data: Record<string, unknown>) {
  const createdAt = serializeFirestoreDate(data.createdAt) || new Date().toISOString();
  return {
    aiResult: data.aiResult,
    aiSummary: data.aiSummary,
    ai_summary: data.aiSummary,
    createdAt,
    created_at: createdAt,
    id,
    imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [],
    input: data.input,
    riskScore: data.riskScore,
    risk_score: data.riskScore,
    stage: data.stage,
    treatmentPlan: data.treatmentPlan,
    treatment_plan: data.treatmentPlan,
    userId: data.userId,
    user_id: data.userId
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const fallback = demoAnalysis(fallbackInput);

  if (id.startsWith("demo") || id.startsWith("offline")) {
    return NextResponse.json({ analysis: { ...fallback, id } });
  }

  const session = await getCurrentUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Login is required to view this analysis." }, { status: 401 });
  }

  const db = createFirebaseAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Firebase Admin database is not configured." }, { status: 503 });
  }

  const snapshot = await db.collection("analysisReports").doc(id).get();

  if (!snapshot.exists) {
    return NextResponse.json({ error: "Analysis report was not found." }, { status: 404 });
  }

  const data = snapshot.data() || {};
  if (data.userId !== session.user.uid && session.user.role !== "admin") {
    return NextResponse.json({ error: "You do not have access to this analysis." }, { status: 403 });
  }

  return NextResponse.json({ analysis: mapAnalysis(snapshot.id, data), mode: "firestore" });
}
