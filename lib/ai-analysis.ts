import { GoogleGenerativeAI } from "@google/generative-ai";
import { env, featureFlags } from "@/lib/env";
import { buildTreatmentPlan, calculateRiskScore, formatStage } from "@/lib/recommendations";
import type { AiHairResult, AnalysisInput, HairStage } from "@/lib/types";

const disclaimer = "AI-based estimate, not medical diagnosis. Consult a licensed clinician for diagnosis, prescriptions, or severe symptoms.";

const stageToNorwood: Record<HairStage, AiHairResult["hairLossStage"]> = {
  advanced: "Stage 5",
  diffuse: "Stage 3",
  early: "Stage 2",
  moderate: "Stage 4"
};

const densityByStage: Record<HairStage, AiHairResult["hairDensity"]> = {
  advanced: "Low",
  diffuse: "Medium",
  early: "High",
  moderate: "Medium"
};

const visibilityByStage: Record<HairStage, AiHairResult["scalpVisibility"]> = {
  advanced: "High",
  diffuse: "Medium",
  early: "Low",
  moderate: "Medium"
};

const recessionByStage: Record<HairStage, AiHairResult["hairlineRecession"]> = {
  advanced: "Advanced",
  diffuse: "Mild",
  early: "Mild",
  moderate: "Moderate"
};

export function fallbackHairAnalysis(input: AnalysisInput): AiHairResult {
  const treatmentPlan = buildTreatmentPlan(input);

  return {
    confidenceScore: Math.min(88, Math.max(58, calculateRiskScore(input))),
    disclaimer,
    hairDensity: densityByStage[input.stage],
    hairlineRecession: recessionByStage[input.stage],
    hairLossStage: stageToNorwood[input.stage],
    recommendation: `${treatmentPlan.title}: ${treatmentPlan.kit.slice(0, 3).join(", ")}.`,
    scalpCondition: input.lifestyle.includes("dandruff") ? "Dry" : "Healthy",
    scalpVisibility: visibilityByStage[input.stage],
    visualInsights: [
      `${formatStage(input.stage)} was selected as the closest visible pattern.`,
      "Use consistent lighting and angles for before, day 30, day 60, and day 90 photos.",
      "Medication decisions should be reviewed by a licensed clinician."
    ]
  };
}

function extractJson(text: string) {
  const jsonBlock = text.match(/```json\s*([\s\S]*?)```/i)?.[1];
  if (jsonBlock) {
    return jsonBlock;
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return text.slice(start, end + 1);
  }

  return text;
}

function normalizeAiResult(value: Partial<AiHairResult>, fallback: AiHairResult): AiHairResult {
  const validDensity = ["Low", "Medium", "High"].includes(String(value.hairDensity));
  const validCondition = ["Healthy", "Dry", "Oily"].includes(String(value.scalpCondition));
  const validVisibility = ["Low", "Medium", "High"].includes(String(value.scalpVisibility));
  const validRecession = ["None", "Mild", "Moderate", "Advanced"].includes(
    String(value.hairlineRecession)
  );
  const stage = /^Stage [1-7]$/.test(String(value.hairLossStage))
    ? (value.hairLossStage as AiHairResult["hairLossStage"])
    : fallback.hairLossStage;

  return {
    confidenceScore:
      typeof value.confidenceScore === "number"
        ? Math.min(95, Math.max(40, Math.round(value.confidenceScore)))
        : fallback.confidenceScore,
    disclaimer,
    hairDensity: validDensity ? (value.hairDensity as AiHairResult["hairDensity"]) : fallback.hairDensity,
    hairlineRecession: validRecession
      ? (value.hairlineRecession as AiHairResult["hairlineRecession"])
      : fallback.hairlineRecession,
    hairLossStage: stage,
    recommendation:
      typeof value.recommendation === "string" && value.recommendation.length > 8
        ? value.recommendation
        : fallback.recommendation,
    scalpCondition: validCondition
      ? (value.scalpCondition as AiHairResult["scalpCondition"])
      : fallback.scalpCondition,
    scalpVisibility: validVisibility
      ? (value.scalpVisibility as AiHairResult["scalpVisibility"])
      : fallback.scalpVisibility,
    visualInsights:
      Array.isArray(value.visualInsights) && value.visualInsights.length
        ? value.visualInsights.slice(0, 5).map(String)
        : fallback.visualInsights
  };
}

export async function analyzeHairImages({
  images,
  input
}: {
  images: Array<{ buffer: Buffer; mimeType: string }>;
  input: AnalysisInput;
}) {
  const fallback = fallbackHairAnalysis(input);

  if (!featureFlags.gemini || !images.length) {
    return fallback;
  }

  try {
    const genAI = new GoogleGenerativeAI(env.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: env.geminiVisionModel });
    const prompt = `You are a conservative AI hair wellness image reviewer. Return only valid JSON.

Analyze uploaded scalp/hair images plus user questionnaire. Estimate visible hair features without diagnosis.

Questionnaire:
${JSON.stringify(input, null, 2)}

Return this exact JSON shape:
{
  "hairDensity": "Low" | "Medium" | "High",
  "hairLossStage": "Stage 1" | "Stage 2" | "Stage 3" | "Stage 4" | "Stage 5" | "Stage 6" | "Stage 7",
  "scalpCondition": "Healthy" | "Dry" | "Oily",
  "scalpVisibility": "Low" | "Medium" | "High",
  "hairlineRecession": "None" | "Mild" | "Moderate" | "Advanced",
  "confidenceScore": number,
  "recommendation": string,
  "visualInsights": string[],
  "disclaimer": "${disclaimer}"
}`;

    const result = await model.generateContent([
      prompt,
      ...images.map((image) => ({
        inlineData: {
          data: image.buffer.toString("base64"),
          mimeType: image.mimeType
        }
      }))
    ]);
    const parsed = JSON.parse(extractJson(result.response.text()));

    return normalizeAiResult(parsed, fallback);
  } catch (error) {
    console.error("Gemini vision analysis failed", error);
    return fallback;
  }
}
