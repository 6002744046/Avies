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

export type HairDensity = "Low" | "Medium" | "High";
export type ScalpCondition = "Healthy" | "Dry" | "Oily";
export type ScalpVisibility = "Low" | "Medium" | "High";
export type HairlineRecession = "None" | "Mild" | "Moderate" | "Advanced";

export type AiHairResult = {
  hairDensity: HairDensity;
  hairLossStage: `Stage ${1 | 2 | 3 | 4 | 5 | 6 | 7}`;
  scalpCondition: ScalpCondition;
  scalpVisibility: ScalpVisibility;
  hairlineRecession: HairlineRecession;
  confidenceScore: number;
  recommendation: string;
  visualInsights: string[];
  disclaimer: string;
};

export type AnalysisRecord = {
  id: string;
  user_id?: string | null;
  userId?: string | null;
  input: AnalysisInput;
  stage: HairStage;
  risk_score: number;
  riskScore?: number;
  ai_summary: string;
  aiSummary?: string;
  aiResult?: AiHairResult;
  imageUrls?: string[];
  treatment_plan: TreatmentPlan;
  treatmentPlan?: TreatmentPlan;
  created_at: string;
  createdAt?: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type CartPlan = "one_time" | "subscription";

export type PaymentStatus = "created" | "paid" | "failed" | "refunded";
export type DeliveryStatus = "Pending" | "Shipped" | "Delivered";

export type ShippingAddress = {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
};

export type OrderRecord = {
  id: string;
  user_id?: string | null;
  userId?: string | null;
  plan_type: CartPlan;
  planType?: CartPlan;
  product?: string;
  address?: ShippingAddress | null;
  amount: number;
  currency?: "INR";
  status: "Processing" | "Shipped" | "Delivered";
  paymentStatus?: PaymentStatus;
  deliveryStatus?: DeliveryStatus;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  paymentId?: string | null;
  razorpay_order_id?: string | null;
  startDate?: string | null;
  expiryDate?: string | null;
  created_at: string;
  createdAt?: string;
};

export type SubscriptionRecord = {
  id: string;
  userId: string;
  planType: "monthly";
  amount: number;
  currency: "INR";
  paymentId?: string | null;
  razorpaySubscriptionId?: string | null;
  status: "created" | "active" | "cancelled" | "past_due";
  startDate: string | null;
  expiryDate: string | null;
  createdAt: string;
};

export type ProgressMilestone = "before" | "day_30" | "day_60" | "day_90";

export type ProgressPhotoRecord = {
  id: string;
  user_id?: string | null;
  userId?: string | null;
  milestone: ProgressMilestone;
  image_url: string;
  imageUrl?: string;
  storagePath?: string;
  notes?: string | null;
  density_score?: number | null;
  densityScore?: number | null;
  created_at: string;
  createdAt?: string;
};

export type RefundRequestRecord = {
  id: string;
  user_id?: string | null;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  admin_notes?: string | null;
  created_at: string;
};
