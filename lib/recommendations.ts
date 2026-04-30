import type { AnalysisInput, HairStage, TreatmentPlan } from "./types";

const stageBaseScore: Record<HairStage, number> = {
  early: 36,
  diffuse: 48,
  moderate: 62,
  advanced: 78
};

const durationScore: Record<AnalysisInput["duration"], number> = {
  under_6_months: 4,
  "6_12_months": 8,
  "1_3_years": 13,
  "3_plus_years": 18
};

export function formatStage(stage: HairStage) {
  return {
    early: "Early recession",
    moderate: "Moderate thinning",
    advanced: "Advanced pattern loss",
    diffuse: "Diffuse shedding"
  }[stage];
}

export function calculateRiskScore(input: AnalysisInput) {
  const lifestyleLoad = input.lifestyle.length * 3;
  const familyLoad = input.familyHistory ? 12 : 0;
  const ageLoad = input.age > 40 ? 8 : input.age > 30 ? 5 : 2;
  return Math.min(
    94,
    stageBaseScore[input.stage] + durationScore[input.duration] + lifestyleLoad + familyLoad + ageLoad
  );
}

export function buildTreatmentPlan(input: AnalysisInput): TreatmentPlan {
  const riskScore = calculateRiskScore(input);
  const likelyFactors = [
    input.familyHistory ? "Genetic sensitivity may be contributing." : "Pattern does not strongly depend on family history.",
    input.duration === "under_6_months"
      ? "Recent shedding can be influenced by stress, sleep, nutrition, or illness."
      : "Longer duration suggests a structured routine and photo tracking will matter.",
    input.lifestyle.includes("stress") ? "Stress load is worth actively reducing." : "Lifestyle inputs do not show major stress flags.",
    input.lifestyle.includes("sleep") ? "Sleep consistency can support recovery routines." : "Sleep was not flagged as a main factor."
  ];

  const kit = [
    "5% topical minoxidil support plan",
    "Dermatologist review prompt for finasteride eligibility",
    "0.5 mm derma roller protocol",
    "Ketoconazole-inspired scalp care shampoo",
    "Biotin, zinc, and vitamin D nutrition checklist"
  ];

  const routine = [
    {
      cadence: "Morning",
      action: "Apply topical support, hydrate scalp, and log adherence."
    },
    {
      cadence: "Evening",
      action: "Repeat topical support and use the low-irritation scalp routine."
    },
    {
      cadence: "Weekly",
      action: "Use the derma roller only as directed, avoiding irritated skin."
    },
    {
      cadence: "Monthly",
      action: "Upload standardized photos for AI-assisted progress comparison."
    }
  ];

  return {
    title:
      riskScore > 75
        ? "Intensive 90-day recovery protocol"
        : riskScore > 55
          ? "Balanced regrowth and retention protocol"
          : "Early retention and scalp optimization protocol",
    riskScore,
    likelyFactors,
    kit,
    routine,
    checkpoints: [
      { day: 0, goal: "Baseline photos and routine onboarding" },
      { day: 30, goal: "Reduced shedding and improved adherence" },
      { day: 60, goal: "Early density signals and scalp comfort check" },
      { day: 90, goal: "Visible comparison review and guarantee eligibility" }
    ],
    disclaimer:
      "This is general wellness guidance, not a medical diagnosis. Medication decisions and persistent shedding should be reviewed with a licensed clinician."
  };
}

export function demoAnalysis(input: AnalysisInput) {
  const treatmentPlan = buildTreatmentPlan(input);

  return {
    id: `demo-${Date.now()}`,
    input,
    stage: input.stage,
    risk_score: treatmentPlan.riskScore,
    ai_summary: `Based on your answers, your pattern looks consistent with ${formatStage(
      input.stage
    ).toLowerCase()} and a ${treatmentPlan.riskScore}% support priority. The strongest next step is a consistent 90-day routine with standardized photo tracking, scalp support, and clinician review for medication eligibility where appropriate.`,
    treatment_plan: treatmentPlan,
    created_at: new Date().toISOString()
  };
}
