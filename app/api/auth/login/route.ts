import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Use Firebase client authentication and POST the ID token to /api/auth/session." },
    { status: 410 }
  );
}
