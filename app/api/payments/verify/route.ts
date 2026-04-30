import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { createFirebaseAdminDb, FieldValue, Timestamp } from "@/lib/firebase-admin";
import {
  getPlan,
  verifyRazorpayOrderSignature,
  verifyRazorpaySubscriptionSignature
} from "@/lib/razorpay";

export const runtime = "nodejs";

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

export async function POST(request: NextRequest) {
  const session = await getCurrentUserFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      localOrderId?: string;
      localSubscriptionId?: string;
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
      razorpay_subscription_id?: string;
      type?: "order" | "subscription";
    };

    if (!body.razorpay_payment_id || !body.razorpay_signature) {
      return NextResponse.json({ error: "Payment verification data is incomplete." }, { status: 400 });
    }

    const db = createFirebaseAdminDb();
    if (!db) {
      return NextResponse.json({ error: "Firebase Admin database is not configured." }, { status: 503 });
    }

    const now = new Date();

    if (body.type === "subscription") {
      if (!body.localSubscriptionId || !body.razorpay_subscription_id) {
        return NextResponse.json({ error: "Subscription verification data is incomplete." }, { status: 400 });
      }

      const verified = verifyRazorpaySubscriptionSignature({
        paymentId: body.razorpay_payment_id,
        signature: body.razorpay_signature,
        subscriptionId: body.razorpay_subscription_id
      });

      if (!verified) {
        return NextResponse.json({ error: "Invalid Razorpay subscription signature." }, { status: 400 });
      }

      const subscriptionRef = db.collection("subscriptions").doc(body.localSubscriptionId);
      const subscriptionSnapshot = await subscriptionRef.get();
      const subscription = subscriptionSnapshot.data();

      if (!subscriptionSnapshot.exists || subscription?.userId !== session.user.uid) {
        return NextResponse.json({ error: "Subscription was not found." }, { status: 404 });
      }

      const plan = getPlan("subscription");
      await subscriptionRef.update({
        expiryDate: Timestamp.fromDate(addMonths(now, 1)),
        paymentId: body.razorpay_payment_id,
        razorpaySubscriptionId: body.razorpay_subscription_id,
        startDate: Timestamp.fromDate(now),
        status: "active",
        updatedAt: FieldValue.serverTimestamp()
      });

      const orderRef = await db.collection("orders").add({
        address: subscription.address || null,
        amount: plan.amount / 100,
        createdAt: FieldValue.serverTimestamp(),
        currency: "INR",
        deliveryStatus: "Pending",
        expiryDate: Timestamp.fromDate(addDays(now, 90)),
        paymentId: body.razorpay_payment_id,
        paymentStatus: "paid",
        planType: "subscription",
        product: plan.product,
        startDate: Timestamp.fromDate(now),
        status: "Processing",
        subscriptionId: subscriptionRef.id,
        userEmail: session.user.email,
        userId: session.user.uid
      });

      return NextResponse.json({
        orderId: orderRef.id,
        status: "active",
        subscriptionId: subscriptionRef.id
      });
    }

    if (!body.localOrderId || !body.razorpay_order_id) {
      return NextResponse.json({ error: "Order verification data is incomplete." }, { status: 400 });
    }

    const verified = verifyRazorpayOrderSignature({
      orderId: body.razorpay_order_id,
      paymentId: body.razorpay_payment_id,
      signature: body.razorpay_signature
    });

    if (!verified) {
      return NextResponse.json({ error: "Invalid Razorpay order signature." }, { status: 400 });
    }

    const orderRef = db.collection("orders").doc(body.localOrderId);
    const orderSnapshot = await orderRef.get();
    const order = orderSnapshot.data();

    if (!orderSnapshot.exists || order?.userId !== session.user.uid) {
      return NextResponse.json({ error: "Order was not found." }, { status: 404 });
    }

    await orderRef.update({
      expiryDate: Timestamp.fromDate(addDays(now, 90)),
      paymentId: body.razorpay_payment_id,
      paymentStatus: "paid",
      razorpayOrderId: body.razorpay_order_id,
      startDate: Timestamp.fromDate(now),
      status: "Processing",
      updatedAt: FieldValue.serverTimestamp()
    });

    return NextResponse.json({
      orderId: orderRef.id,
      status: "paid"
    });
  } catch (error) {
    console.error("Payment verification failed", error);
    return NextResponse.json({ error: "Could not verify payment." }, { status: 500 });
  }
}
