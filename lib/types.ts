export type HairStage = "early" | "moderate" | "advanced" | "diffuse";

export type AnalysisInput = {
  age: number;
  gender: "male" | "female" | "non_binary" | "prefer_not_to_say";
  stage: HairStage;
  duration: "under_6_months" | "6_12_months" | "1_3_years" | "3_plus_years";
  familyHistory: boolean;
  lifestyle: string[];
  goals: string[];
};

export type TreatmentPlan = {
  title: string;
  riskScore: number;
  likelyFactors: string[];
  kit: string[];
  routine: Array<{
    cadence: string;
    action: string;
  }>;
  checkpoints: Array<{
    day: number;
    goal: string;
  }>;
  disclaimer: string;
};

export type AnalysisRecord = {
  id: string;
  user_id?: string | null;
  input: AnalysisInput;
  stage: HairStage;
  risk_score: number;
  ai_summary: string;
  treatment_plan: TreatmentPlan;
  created_at: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type CartPlan = "one_time" | "subscription";

export type OrderRecord = {
  id: string;
  user_id?: string | null;
  plan_type: CartPlan;
  amount: number;
  status: "Processing" | "Shipped" | "Delivered";
  razorpay_order_id?: string | null;
  created_at: string;
};

export type ProgressMilestone = "before" | "day_30" | "day_60" | "day_90";

export type ProgressPhotoRecord = {
  id: string;
  user_id?: string | null;
  milestone: ProgressMilestone;
  image_url: string;
  notes?: string | null;
  density_score?: number | null;
  created_at: string;
};

export type RefundRequestRecord = {
  id: string;
  user_id?: string | null;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  admin_notes?: string | null;
  created_at: string;
};
