# AI Hair Recovery Platform

Production-ready MVP for an AI-powered hair care business: Firebase auth, Firestore data, Firebase Storage photo uploads, Gemini image analysis, Razorpay payments/subscriptions, orders, admin analytics, refund reviews, and WhatsApp support.

## Folder Structure

- `app/api/analysis` - authenticated AI analysis and report retrieval
- `app/api/uploads` - authenticated Firebase Storage photo uploads
- `app/api/payments` - Razorpay checkout and signature verification
- `app/api/webhooks/razorpay` - Razorpay webhook verification
- `app/api/orders` - authenticated order history
- `app/api/admin` - admin-only metrics, users, orders, refunds
- `components/product` - pricing and checkout UI
- `components/upload` - mobile camera/file upload with compression and progress
- `components/orders` - customer order tracking
- `components/admin` - analytics, role management, delivery updates, AI reports
- `lib/firebase-admin.ts` - server Firebase Admin Auth, Firestore, Storage
- `lib/razorpay.ts` - Razorpay order/subscription/signature helpers
- `lib/ai-analysis.ts` - Gemini Vision structured hair analysis

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Firebase Setup

1. Create a Firebase project.
2. Enable **Authentication > Email/Password**.
3. Create **Firestore Database**.
4. Create **Storage** and copy the bucket name.
5. In **Project settings > General > Web app**, paste client values:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

6. In **Project settings > Service accounts**, generate a private key and paste:

```bash
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Alternative: set `FIREBASE_SERVICE_ACCOUNT_BASE64` to a base64-encoded service-account JSON.

## Firestore Collections

- `users`: `{ uid, email, role: "admin" | "user", createdAt }`
- `orders`: `{ userId, planType, product, address, amount, paymentId, paymentStatus, deliveryStatus, startDate, expiryDate }`
- `subscriptions`: `{ userId, planType: "monthly", paymentId, status, startDate, expiryDate }`
- `analysisReports`: `{ userId, input, imageUrls, aiResult, aiSummary, treatmentPlan, riskScore, createdAt }`
- `progressPhotos`: `{ userId, milestone, imageUrl, storagePath, notes, createdAt }`
- `refundRequests`: `{ userId, userEmail, reason, status, evidenceWindowDays, createdAt, reviewedAt, reviewedBy }`

Create your founder admin account by signing up at `/signup`, then set your Firestore `users/{uid}.role` to `admin`.

## Razorpay Setup

Set:

```bash
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_SUBSCRIPTION_PLAN_ID=
RAZORPAY_WEBHOOK_SECRET=
```

In Razorpay Dashboard:

1. Create API keys.
2. Create a monthly subscription plan and paste its ID into `RAZORPAY_SUBSCRIPTION_PLAN_ID`.
3. Add a webhook URL:

```text
https://your-domain.com/api/webhooks/razorpay
```

4. Subscribe to `payment.captured`, `order.paid`, and subscription events.

The browser only receives the public key. Payment verification and webhook verification use server-only secrets.

## Gemini Vision Setup

```bash
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
GEMINI_VISION_MODEL=gemini-1.5-flash
```

AI results return structured estimates:

```ts
{
  hairDensity: "Low" | "Medium" | "High",
  hairLossStage: "Stage 1" | "Stage 2" | "Stage 3" | "Stage 4" | "Stage 5" | "Stage 6" | "Stage 7",
  scalpCondition: "Healthy" | "Dry" | "Oily",
  scalpVisibility: "Low" | "Medium" | "High",
  hairlineRecession: "None" | "Mild" | "Moderate" | "Advanced",
  recommendation: string
}
```

Every result shows: `AI-based estimate, not medical diagnosis`.

## WhatsApp Support

Set:

```bash
NEXT_PUBLIC_WHATSAPP_NUMBER=919999999999
```

The floating support button opens `https://wa.me/<number>`.

## Important Routes

- `/` premium landing page with scroll-driven 3D journey animation
- `/signup` and `/login` Firebase email/password auth
- `/analysis` photo + questionnaire AI analysis
- `/results/[id]` structured AI result and treatment recommendation
- `/pricing` Razorpay checkout for kit or subscription
- `/orders` customer order and delivery tracking
- `/dashboard` progress uploads and refund request
- `/admin` admin analytics, role management, orders, AI reports, refunds

## Deploy To Vercel

1. Push the repo to GitHub.
2. Import it in Vercel.
3. Add every env var from `.env.example`.
4. Set:

```bash
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

5. Add your Vercel webhook URL in Razorpay.
6. Deploy.

## Verification

```bash
npm run typecheck
npm run lint
npm run build
```

Turbopack may need normal local permissions because it starts worker processes during CSS processing.
