import { NextRequest, NextResponse } from "next/server";
import {
  normalizeUserRole,
  requireAdminRequest,
  serializeFirestoreDate
} from "@/lib/auth";
import { createFirebaseAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

type FirestoreUserRecord = {
  createdAt?: unknown;
  email?: unknown;
  role?: unknown;
  uid?: unknown;
};

type RefundRecord = {
  adminNotes?: unknown;
  createdAt?: unknown;
  reason?: unknown;
  reviewedAt?: unknown;
  status?: unknown;
  userEmail?: unknown;
  userId?: unknown;
};

function dateKey(value: string | null) {
  if (!value) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short"
  }).format(new Date(value));
}

function mapUser(id: string, data: FirestoreUserRecord) {
  return {
    createdAt: serializeFirestoreDate(data.createdAt),
    email: typeof data.email === "string" ? data.email : "",
    role: normalizeUserRole(data.role),
    uid: typeof data.uid === "string" ? data.uid : id
  };
}

function normalizeRefundStatus(status: unknown) {
  return status === "approved" || status === "denied" ? status : "pending";
}

function mapRefund(id: string, data: RefundRecord) {
  return {
    adminNotes: typeof data.adminNotes === "string" ? data.adminNotes : "",
    createdAt: serializeFirestoreDate(data.createdAt),
    id,
    reason:
      typeof data.reason === "string"
        ? data.reason
        : "90-day guarantee request awaiting evidence review.",
    reviewedAt: serializeFirestoreDate(data.reviewedAt),
    status: normalizeRefundStatus(data.status),
    userEmail: typeof data.userEmail === "string" ? data.userEmail : "",
    userId: typeof data.userId === "string" ? data.userId : ""
  };
}

function mapOrder(id: string, data: Record<string, unknown>) {
  const createdAt = serializeFirestoreDate(data.createdAt);
  return {
    amount: Number(data.amount || 0),
    createdAt,
    deliveryStatus:
      data.deliveryStatus === "Shipped" || data.deliveryStatus === "Delivered"
        ? data.deliveryStatus
        : "Pending",
    id,
    paymentStatus:
      data.paymentStatus === "paid" || data.paymentStatus === "failed" || data.paymentStatus === "refunded"
        ? data.paymentStatus
        : "created",
    planType: data.planType === "subscription" ? "subscription" : "one_time",
    product: typeof data.product === "string" ? data.product : "AviEx Hair Recovery Kit",
    razorpayOrderId: typeof data.razorpayOrderId === "string" ? data.razorpayOrderId : "",
    userEmail: typeof data.userEmail === "string" ? data.userEmail : "",
    userId: typeof data.userId === "string" ? data.userId : ""
  };
}

function mapSubscription(id: string, data: Record<string, unknown>) {
  return {
    amount: Number(data.amount || 0),
    createdAt: serializeFirestoreDate(data.createdAt),
    expiryDate: serializeFirestoreDate(data.expiryDate),
    id,
    status: typeof data.status === "string" ? data.status : "created",
    userEmail: typeof data.userEmail === "string" ? data.userEmail : "",
    userId: typeof data.userId === "string" ? data.userId : ""
  };
}

function mapReport(id: string, data: Record<string, unknown>) {
  const aiResult = (data.aiResult || {}) as Record<string, unknown>;
  const imageUrls = Array.isArray(data.imageUrls) ? data.imageUrls.map(String) : [];
  return {
    createdAt: serializeFirestoreDate(data.createdAt),
    hairDensity: typeof aiResult.hairDensity === "string" ? aiResult.hairDensity : "",
    hairLossStage: typeof aiResult.hairLossStage === "string" ? aiResult.hairLossStage : "",
    id,
    imageUrl: imageUrls[0] || "",
    recommendation: typeof aiResult.recommendation === "string" ? aiResult.recommendation : "",
    userId: typeof data.userId === "string" ? data.userId : ""
  };
}

async function getCount(collectionName: string) {
  const db = createFirebaseAdminDb();
  if (!db) {
    return 0;
  }

  const snapshot = await db.collection(collectionName).count().get();
  return snapshot.data().count;
}

function groupRevenue(orders: ReturnType<typeof mapOrder>[]) {
  const grouped = new Map<string, number>();

  orders
    .filter((order) => order.paymentStatus === "paid")
    .forEach((order) => {
      const key = dateKey(order.createdAt);
      grouped.set(key, (grouped.get(key) || 0) + order.amount);
    });

  return Array.from(grouped.entries()).map(([date, revenue]) => ({ date, revenue }));
}

function groupUsers(users: ReturnType<typeof mapUser>[]) {
  const grouped = new Map<string, number>();

  users.forEach((user) => {
    const key = dateKey(user.createdAt);
    grouped.set(key, (grouped.get(key) || 0) + 1);
  });

  return Array.from(grouped.entries()).map(([date, users]) => ({ date, users }));
}

export async function GET(request: NextRequest) {
  const guard = await requireAdminRequest(request);
  if (!guard.ok) {
    return guard.response;
  }

  const db = createFirebaseAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Firebase Admin database is not configured." }, { status: 503 });
  }

  const [
    usersSnapshot,
    refundsSnapshot,
    ordersSnapshot,
    subscriptionsSnapshot,
    reportsSnapshot,
    usersCount,
    ordersCount,
    refundCount
  ] = await Promise.all([
    db.collection("users").orderBy("createdAt", "desc").limit(200).get(),
    db.collection("refundRequests").orderBy("createdAt", "desc").limit(25).get(),
    db.collection("orders").orderBy("createdAt", "desc").limit(200).get(),
    db.collection("subscriptions").orderBy("createdAt", "desc").limit(100).get(),
    db.collection("analysisReports").orderBy("createdAt", "desc").limit(50).get(),
    getCount("users"),
    getCount("orders"),
    getCount("refundRequests")
  ]);

  const users = usersSnapshot.docs.map((doc) => mapUser(doc.id, doc.data() as FirestoreUserRecord));
  const refunds = refundsSnapshot.docs.map((doc) => mapRefund(doc.id, doc.data() as RefundRecord));
  const orders = ordersSnapshot.docs.map((doc) => mapOrder(doc.id, doc.data()));
  const subscriptions = subscriptionsSnapshot.docs.map((doc) => mapSubscription(doc.id, doc.data()));
  const reports = reportsSnapshot.docs.map((doc) => mapReport(doc.id, doc.data()));
  const revenue = orders
    .filter((order) => order.paymentStatus === "paid")
    .reduce((total, order) => total + order.amount, 0);

  return NextResponse.json({
    charts: {
      revenue: groupRevenue(orders).slice(-14),
      userGrowth: groupUsers(users).slice(-14)
    },
    metrics: {
      activeSubscriptions: subscriptions.filter((subscription) => subscription.status === "active").length,
      orders: ordersCount,
      refunds: refundCount,
      refundsPending: refunds.filter((refund) => refund.status === "pending").length,
      revenue,
      users: usersCount
    },
    mode: "firestore",
    orders: orders.slice(0, 50),
    refunds,
    reports,
    subscriptions,
    users
  });
}
