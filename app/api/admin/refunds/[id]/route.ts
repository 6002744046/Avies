import { NextRequest, NextResponse } from "next/server";
import { requireAdminRequest, serializeFirestoreDate } from "@/lib/auth";
import { createFirebaseAdminDb, FieldValue } from "@/lib/firebase-admin";

export const runtime = "nodejs";

type RefundDecision = {
  adminNotes?: string;
  admin_notes?: string;
  status?: "approved" | "denied" | "Approved" | "Rejected";
};

function normalizeDecision(status: RefundDecision["status"]) {
  if (status === "approved" || status === "Approved") {
    return "approved";
  }

  if (status === "denied" || status === "Rejected") {
    return "denied";
  }

  return null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminRequest(request);
  if (!guard.ok) {
    return guard.response;
  }

  const { id } = await params;
  let body: RefundDecision = {};

  try {
    body = (await request.json()) as RefundDecision;
  } catch {
    body = {};
  }

  const status = normalizeDecision(body.status);
  if (!status) {
    return NextResponse.json({ error: "Refund status must be approved or denied." }, { status: 400 });
  }

  const db = createFirebaseAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Firebase Admin database is not configured." }, { status: 503 });
  }

  const refundRef = db.collection("refundRequests").doc(id);
  const snapshot = await refundRef.get();

  if (!snapshot.exists) {
    return NextResponse.json({ error: "Refund request was not found." }, { status: 404 });
  }

  await refundRef.update({
    adminNotes: body.adminNotes || body.admin_notes || `${status} by ${guard.user.email || "admin"}.`,
    reviewedAt: FieldValue.serverTimestamp(),
    reviewedBy: guard.user.uid,
    status
  });

  const updated = await refundRef.get();
  const data = updated.data() || {};

  return NextResponse.json({
    refund: {
      adminNotes: typeof data.adminNotes === "string" ? data.adminNotes : "",
      createdAt: serializeFirestoreDate(data.createdAt),
      id,
      reason:
        typeof data.reason === "string"
          ? data.reason
          : "90-day guarantee request awaiting evidence review.",
      reviewedAt: serializeFirestoreDate(data.reviewedAt),
      status: data.status === "approved" || data.status === "denied" ? data.status : "pending",
      userEmail: typeof data.userEmail === "string" ? data.userEmail : "",
      userId: typeof data.userId === "string" ? data.userId : ""
    }
  });
}
