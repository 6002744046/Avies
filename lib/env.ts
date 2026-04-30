export const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  supabaseProgressBucket: process.env.SUPABASE_PROGRESS_BUCKET || "progress-photos",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
  razorpayPublicKey: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  razorpaySubscriptionPlanId: process.env.RAZORPAY_SUBSCRIPTION_PLAN_ID || ""
};

export const featureFlags = {
  supabase: Boolean(env.supabaseUrl && env.supabaseAnonKey),
  supabaseAdmin: Boolean(env.supabaseUrl && env.supabaseServiceRoleKey),
  gemini: Boolean(env.geminiApiKey),
  razorpay: Boolean(env.razorpayKeyId && env.razorpayKeySecret)
};
