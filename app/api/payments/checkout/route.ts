import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { env, featureFlags } from "@/lib/env";
import { createFirebaseAdminDb, FieldValue } from "@/lib/firebase-admin";
import { createRazorpayOrder, createRazorpaySubscription, getPlan } from "@/lib/razorpay";
import type { CartPlan, ShippingAddress } from "@/lib/types";

export const runtime = "nodejs";

function normalizePlan(value: unknown): CartPlan {
  return value === "subscription" ? "subscription" : "one_time";
}

function isValidAddress(address: Partial<ShippingAddress> | null | undefined) {
  return Boolean(
    address?.name?.trim() &&
      address.phone?.trim() &&
      address.line1?.trim() &&
      address.city?.trim() &&
      address.state?.trim() &&
      address.postalCode?.trim()
  );
}

export async function POST(request: NextRequest) {
  const session = await getCurrentUserFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: "Login is required before checkout." }, { status: 401 });
  }

  if (!featureFlags.razorpay) {
    return NextResponse.json({ error: "Razorpay keys are not configured." }, { status: 503 });
  }

  try {
    const body = (await request.json()) as {
      address?: ShippingAddress;
      plan?: CartPlan;
      planType?: CartPlan;
    };
    const planType = normalizePlan(body.planType || body.plan);
    const plan = getPlan(planType);

    if (!isValidAddress(body.address)) {
      return NextResponse.json({ error: "Complete shipping address is required." }, { status: 400 });
    }

    const db = createFirebaseAdminDb();
    if (!db) {
      return NextResponse.json({ error: "Firebase Admin database is not configured." }, { status: 503 });
    }

    if (planType === "subscription") {
      const subscriptionRef = db.collection("subscriptions").doc();
      await subscriptionRef.set({
        address: body.address,
        amount: plan.amount / 100,
        createdAt: FieldValue.serverTimestamp(),
        currency: "INR",
        expiryDate: null,
        paymentId: null,
        planType: "monthly",
        product: plan.product,
        startDate: null,
        status: "created",
        userEmail: session.user.email,
        userId: session.user.uid
      });

      const subscription = await createRazorpaySubscription({
        notes: {
          localSubscriptionId: subscriptionRef.id,
          userId: session.user.uid
        }
      });

      await subscriptionRef.update({
        razorpaySubscriptionId: subscription.id,
        razorpayStatus: subscription.status
      });

      return NextResponse.json({
        checkout: {
          amount: plan.amount,
          currency: "INR",
          localSubscriptionId: subscriptionRef.id,
          mode: "razorpay",
          subscriptionId: subscription.id,
          type: "subscription"
        },
        publicKey: env.razorpayPublicKey || env.razorpayKeyId
      });
    }

    const orderRef = db.collection("orders").doc();
    await orderRef.set({
      address: body.address,
      amount: plan.amount / 100,
      createdAt: FieldValue.serverTimestamp(),
      currency: "INR",
      deliveryStatus: "Pending",
      expiryDate: null,
      paymentId: null,
      paymentStatus: "created",
      planType,
      product: plan.product,
      startDate: null,
      status: "Processing",
      userEmail: session.user.email,
      userId: session.user.uid
    });

    const order = await createRazorpayOrder({
      planType,
      receipt: orderRef.id
    });

    await orderRef.update({
      razorpayOrderId: order.id
    });

    return NextResponse.json({
      checkout: {
        amount: order.amount,
        currency: order.currency,
        localOrderId: orderRef.id,
        mode: "razorpay",
        orderId: order.id,
        type: "order"
      },
      publicKey: env.razorpayPublicKey || env.razorpayKeyId
    });
  } catch (error) {
    console.error("Payment checkout failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create checkout." },
      { status: 500 }
    );
  }
}
