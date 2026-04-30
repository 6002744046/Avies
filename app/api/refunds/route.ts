import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { createFirebaseAdminDb, FieldValue } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await getCurrentUserFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Login is required to request a refund review." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { reason?: string };
    const reason =
      body.reason || "Completed 90-day routine and requesting visible progress review.";
    const db = createFirebaseAdminDb();

    if (!db) {
      return NextResponse.json(
        { message: "Firebase Admin database is not configured for refund reviews." },
        { status: 503 }
      );
    }

    const refundRef = await db.collection("refundRequests").add({
      createdAt: FieldValue.serverTimestamp(),
      evidenceWindowDays: 90,
      reason,
      status: "pending",
      userEmail: session.user.email,
      userId: session.user.uid
    });

    return NextResponse.json({
      message: "Guarantee request submitted for admin review.",
      refund: {
        id: refundRef.id,
        reason,
        status: "pending"
      }
    });
  } catch (error) {
    console.error("Refund route failed", error);
    return NextResponse.json({ message: "Could not submit guarantee request." }, { status: 500 });
  }
}
