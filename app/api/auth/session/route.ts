import { NextRequest, NextResponse } from "next/server";
import { attachSessionCookie, createSessionFromIdToken } from "@/lib/auth";

export const runtime = "nodejs";

type SessionRequest = {
  idToken?: string;
};

export async function POST(request: NextRequest) {
  let body: SessionRequest = {};

  try {
    body = (await request.json()) as SessionRequest;
  } catch {
    body = {};
  }

  if (!body.idToken) {
    return NextResponse.json({ error: "Firebase ID token is required." }, { status: 400 });
  }

  try {
    const { sessionCookie, user } = await createSessionFromIdToken(body.idToken);
    const response = NextResponse.json({ user });
    attachSessionCookie(response, sessionCookie);

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not create a secure Firebase session."
      },
      { status: 401 }
    );
  }
}
