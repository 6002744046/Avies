import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest, serializeFirestoreDate } from "@/lib/auth";
import { createFirebaseAdminDb } from "@/lib/firebase-admin";
import type { OrderRecord } from "@/lib/types";

export const runtime = "nodejs";

function mapOrder(id: string, data: Record<string, unknown>): OrderRecord {
  const createdAt = serializeFirestoreDate(data.createdAt) || new Date().toISOString();
  return {
    address: (data.address as OrderRecord["address"]) || null,
    amount: Number(data.amount || 0),
    createdAt,
    created_at: createdAt,
    currency: "INR",
    deliveryStatus: data.deliveryStatus === "Shipped" || data.deliveryStatus === "Delivered" ? data.deliveryStatus : "Pending",
    expiryDate: serializeFirestoreDate(data.expiryDate),
    id,
    paymentId: typeof data.paymentId === "string" ? data.paymentId : null,
    paymentStatus:
      data.paymentStatus === "paid" || data.paymentStatus === "failed" || data.paymentStatus === "refunded"
        ? data.paymentStatus
        : "created",
    plan_type: data.planType === "subscription" ? "subscription" : "one_time",
    planType: data.planType === "subscription" ? "subscription" : "one_time",
    product: typeof data.product === "string" ? data.product : "AviEx Hair Recovery Kit",
    razorpayOrderId: typeof data.razorpayOrderId === "string" ? data.razorpayOrderId : null,
    razorpay_order_id: typeof data.razorpayOrderId === "string" ? data.razorpayOrderId : null,
    startDate: serializeFirestoreDate(data.startDate),
    status: data.deliveryStatus === "Shipped" || data.deliveryStatus === "Delivered" ? data.deliveryStatus : "Processing",
    userId: typeof data.userId === "string" ? data.userId : null,
    user_id: typeof data.userId === "string" ? data.userId : null
  };
}

export async function GET(request: NextRequest) {
  const session = await getCurrentUserFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const db = createFirebaseAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Firebase Admin database is not configured." }, { status: 503 });
  }

  const snapshot = await db
    .collection("orders")
    .where("userId", "==", session.user.uid)
    .limit(50)
    .get();
  const orders = snapshot.docs
    .map((doc) => mapOrder(doc.id, doc.data()))
    .sort((left, right) => Date.parse(right.createdAt || "") - Date.parse(left.createdAt || ""));

  return NextResponse.json({ orders });
}
