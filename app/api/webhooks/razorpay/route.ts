import { NextRequest, NextResponse } from "next/server";
import { createFirebaseAdminDb, FieldValue, Timestamp } from "@/lib/firebase-admin";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";

export const runtime = "nodejs";

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

async function updateOrderByRazorpayId(razorpayOrderId: string, updates: Record<string, unknown>) {
  const db = createFirebaseAdminDb();
  if (!db) {
    return;
  }

  const snapshot = await db
    .collection("orders")
    .where("razorpayOrderId", "==", razorpayOrderId)
    .limit(1)
    .get();

  await Promise.all(snapshot.docs.map((doc) => doc.ref.update(updates)));
}

async function updateSubscriptionByRazorpayId(
  razorpaySubscriptionId: string,
  updates: Record<string, unknown>
) {
  const db = createFirebaseAdminDb();
  if (!db) {
    return;
  }

  const snapshot = await db
    .collection("subscriptions")
    .where("razorpaySubscriptionId", "==", razorpaySubscriptionId)
    .limit(1)
    .get();

  await Promise.all(snapshot.docs.map((doc) => doc.ref.update(updates)));
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";

  if (!verifyRazorpayWebhookSignature({ body, signature })) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  try {
    const event = JSON.parse(body) as {
      event?: string;
      payload?: {
        order?: { entity?: { id?: string; status?: string } };
        payment?: { entity?: { id?: string; order_id?: string; status?: string } };
        subscription?: { entity?: { id?: string; status?: string } };
      };
    };
    const now = new Date();
    const payment = event.payload?.payment?.entity;
    const order = event.payload?.order?.entity;
    const subscription = event.payload?.subscription?.entity;

    if ((event.event === "payment.captured" || event.event === "order.paid") && (payment?.order_id || order?.id)) {
      await updateOrderByRazorpayId(payment?.order_id || order?.id || "", {
        expiryDate: Timestamp.fromDate(addDays(now, 90)),
        paymentId: payment?.id || null,
        paymentStatus: "paid",
        startDate: Timestamp.fromDate(now),
        updatedAt: FieldValue.serverTimestamp()
      });
    }

    if (subscription?.id) {
      const status = subscription.status === "active" ? "active" : subscription.status || "created";
      await updateSubscriptionByRazorpayId(subscription.id, {
        status,
        updatedAt: FieldValue.serverTimestamp()
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook failed", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
