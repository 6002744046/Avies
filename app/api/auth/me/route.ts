import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getCurrentUserFromRequest(request);

  return NextResponse.json({ user: session?.user || null });
}
