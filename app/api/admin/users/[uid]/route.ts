import { NextRequest, NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/auth";
import { createFirebaseAdminDb, FieldValue } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  const guard = await requireAdminRequest(request);
  if (!guard.ok) {
    return guard.response;
  }

  const { uid } = await params;
  const body = (await request.json().catch(() => ({}))) as { role?: "admin" | "user" };

  if (!["admin", "user"].includes(body.role || "")) {
    return NextResponse.json({ error: "Role must be admin or user." }, { status: 400 });
  }

  if (uid === guard.user.uid && body.role !== "admin") {
    return NextResponse.json({ error: "You cannot remove your own admin role." }, { status: 400 });
  }

  const db = createFirebaseAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Firebase Admin database is not configured." }, { status: 503 });
  }

  await db.collection("users").doc(uid).set(
    {
      role: body.role,
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  return NextResponse.json({ role: body.role, uid });
}
