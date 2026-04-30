import { env, featureFlags } from "./env";
import type { CartPlan } from "./types";

function authHeader() {
  return `Basic ${Buffer.from(`${env.razorpayKeyId}:${env.razorpayKeySecret}`).toString("base64")}`;
}

export async function createRazorpayCheckout(plan: CartPlan) {
  const amount = plan === "subscription" ? 249900 : 749900;

  if (!featureFlags.razorpay) {
    return {
      mode: "demo" as const,
      amount,
      currency: "INR",
      orderId: `demo_order_${Date.now()}`,
      subscriptionId: plan === "subscription" ? `demo_sub_${Date.now()}` : null
    };
  }

  if (plan === "subscription" && env.razorpaySubscriptionPlanId) {
    const response = await fetch("https://api.razorpay.com/v1/subscriptions", {
      method: "POST",
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        plan_id: env.razorpaySubscriptionPlanId,
        total_count: 12,
        quantity: 1,
        customer_notify: 1
      })
    });

    if (!response.ok) {
      throw new Error(`Razorpay subscription failed: ${response.status}`);
    }

    const subscription = await response.json();
    return {
      mode: "razorpay" as const,
      amount,
      currency: "INR",
      orderId: null,
      subscriptionId: subscription.id as string
    };
  }

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount,
      currency: "INR",
      receipt: `hair-kit-${Date.now()}`
    })
  });

  if (!response.ok) {
    throw new Error(`Razorpay order failed: ${response.status}`);
  }

  const order = await response.json();
  return {
    mode: "razorpay" as const,
    amount,
    currency: "INR",
    orderId: order.id as string,
    subscriptionId: null
  };
}
