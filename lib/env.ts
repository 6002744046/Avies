export const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const env = {
  firebaseApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  firebaseAppId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  firebaseAuthDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
  firebaseMessagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY || "",
  firebaseProjectId:
    process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  firebaseServiceAccountBase64: process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || "",
  firebaseStorageBucket:
    process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  authJwtSecret: process.env.AUTH_JWT_SECRET || process.env.SUPABASE_JWT_SECRET || "",
  supabaseProgressBucket: process.env.SUPABASE_PROGRESS_BUCKET || "progress-photos",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  geminiVisionModel: process.env.GEMINI_VISION_MODEL || process.env.GEMINI_MODEL || "gemini-1.5-flash",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
  razorpayPublicKey: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  razorpaySubscriptionPlanId: process.env.RAZORPAY_SUBSCRIPTION_PLAN_ID || "",
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""
};

export const featureFlags = {
  firebaseClient: Boolean(
    env.firebaseApiKey && env.firebaseAppId && env.firebaseAuthDomain && env.firebaseProjectId
  ),
  firebaseAdmin: Boolean(
    env.firebaseServiceAccountBase64 ||
      (env.firebaseProjectId && env.firebaseClientEmail && env.firebasePrivateKey)
  ),
  supabase: Boolean(env.supabaseUrl && env.supabaseAnonKey),
  supabaseAdmin: Boolean(env.supabaseUrl && env.supabaseServiceRoleKey),
  auth: Boolean(
    env.firebaseApiKey &&
      env.firebaseAppId &&
      env.firebaseAuthDomain &&
      env.firebaseProjectId &&
      (env.firebaseServiceAccountBase64 ||
        (env.firebaseClientEmail && env.firebasePrivateKey))
  ),
  gemini: Boolean(env.geminiApiKey),
  razorpay: Boolean(env.razorpayKeyId && env.razorpayKeySecret)
};
