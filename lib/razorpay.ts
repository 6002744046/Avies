import { createHmac, timingSafeEqual } from "crypto";
import { env, featureFlags } from "./env";
import type { CartPlan } from "./types";

export type RazorpayPlan = {
  amount: number;
  description: string;
  intervalMonths: number;
  label: string;
  planType: CartPlan;
  product: string;
};

export const planCatalog: Record<CartPlan, RazorpayPlan> = {
  one_time: {
    amount: 749900,
    description: "90-day personalized hair recovery kit",
    intervalMonths: 0,
    label: "90-day kit",
    planType: "one_time",
    product: "AviEx 90-Day Hair Recovery Kit"
  },
  subscription: {
    amount: 249900,
    description: "Monthly AI-guided hair treatment refill",
    intervalMonths: 1,
    label: "Monthly treatment",
    planType: "subscription",
    product: "AviEx Monthly Hair Treatment"
  }
};

function authHeader() {
  return `Basic ${Buffer.from(`${env.razorpayKeyId}:${env.razorpayKeySecret}`).toString("base64")}`;
}

function requireRazorpayConfig() {
  if (!featureFlags.razorpay) {
    throw new Error("Razorpay key ID and key secret are required.");
  }
}

export function getPlan(planType: CartPlan) {
  return planCatalog[planType] || planCatalog.one_time;
}

export async function createRazorpayOrder({
  receipt,
  planType
}: {
  receipt: string;
  planType: CartPlan;
}) {
  requireRazorpayConfig();

  const plan = getPlan(planType);
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: plan.amount,
      currency: "INR",
      notes: {
        planType
      },
      receipt
    })
  });

  if (!response.ok) {
    throw new Error(`Razorpay order failed: ${response.status}`);
  }

  return (await response.json()) as { amount: number; currency: "INR"; id: string };
}

export async function createRazorpaySubscription({
  notes
}: {
  notes: Record<string, string>;
}) {
  requireRazorpayConfig();

  if (!env.razorpaySubscriptionPlanId) {
    throw new Error("RAZORPAY_SUBSCRIPTION_PLAN_ID is required for subscriptions.");
  }

  const response = await fetch("https://api.razorpay.com/v1/subscriptions", {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      customer_notify: 1,
      notes,
      plan_id: env.razorpaySubscriptionPlanId,
      quantity: 1,
      total_count: 12
    })
  });

  if (!response.ok) {
    throw new Error(`Razorpay subscription failed: ${response.status}`);
  }

  return (await response.json()) as { id: string; status: string };
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyRazorpayOrderSignature({
  orderId,
  paymentId,
  signature
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const expected = createHmac("sha256", env.razorpayKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return safeEqual(expected, signature);
}

export function verifyRazorpaySubscriptionSignature({
  paymentId,
  signature,
  subscriptionId
}: {
  paymentId: string;
  signature: string;
  subscriptionId: string;
}) {
  const expected = createHmac("sha256", env.razorpayKeySecret)
    .update(`${paymentId}|${subscriptionId}`)
    .digest("hex");

  return safeEqual(expected, signature);
}

export function verifyRazorpayWebhookSignature({
  body,
  signature
}: {
  body: string;
  signature: string;
}) {
  if (!env.razorpayWebhookSecret) {
    return false;
  }

  const expected = createHmac("sha256", env.razorpayWebhookSecret).update(body).digest("hex");
  return safeEqual(expected, signature);
}
