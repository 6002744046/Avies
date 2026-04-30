import { NextRequest, NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/auth";
import { createFirebaseAdminDb, FieldValue } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const deliveryStatuses = new Set(["Pending", "Shipped", "Delivered"]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminRequest(request);
  if (!guard.ok) {
    return guard.response;
  }

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { deliveryStatus?: string };

  if (!deliveryStatuses.has(body.deliveryStatus || "")) {
    return NextResponse.json({ error: "Invalid delivery status." }, { status: 400 });
  }

  const db = createFirebaseAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Firebase Admin database is not configured." }, { status: 503 });
  }

  await db.collection("orders").doc(id).update({
    deliveryStatus: body.deliveryStatus,
    status: body.deliveryStatus === "Pending" ? "Processing" : body.deliveryStatus,
    updatedAt: FieldValue.serverTimestamp()
  });

  return NextResponse.json({ deliveryStatus: body.deliveryStatus, id });
}
