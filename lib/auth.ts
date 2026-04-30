import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { DecodedIdToken } from "firebase-admin/auth";
import { createFirebaseAdminAuth, createFirebaseAdminDb, FieldValue, Timestamp } from "@/lib/firebase-admin";

export const AUTH_COOKIE_NAME = "aviex_firebase_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 5;

export type UserRole = "admin" | "user";

export type AuthUser = {
  id: string;
  uid: string;
  authUserId: string;
  email: string | null;
  fullName: string | null;
  role: UserRole;
  createdAt: string | null;
};

type GuardSuccess = {
  ok: true;
  user: AuthUser;
  claims: DecodedIdToken;
};

type GuardFailure = {
  ok: false;
  response: NextResponse;
};

type FirestoreUserRecord = {
  uid?: unknown;
  email?: unknown;
  role?: unknown;
  createdAt?: unknown;
};

export function normalizeUserRole(role: unknown): UserRole {
  return role === "admin" ? "admin" : "user";
}

export function serializeFirestoreDate(value: unknown) {
  if (!value) {
    return null;
  }

  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  return null;
}

function mapUserDocument(uid: string, data: FirestoreUserRecord): AuthUser {
  return {
    authUserId: uid,
    createdAt: serializeFirestoreDate(data.createdAt),
    email: typeof data.email === "string" ? data.email : null,
    fullName: null,
    id: uid,
    role: normalizeUserRole(data.role),
    uid: typeof data.uid === "string" ? data.uid : uid
  };
}

async function getUserByUid(uid: string) {
  const db = createFirebaseAdminDb();
  if (!db) {
    return null;
  }

  const snapshot = await db.collection("users").doc(uid).get();
  if (!snapshot.exists) {
    return null;
  }

  return mapUserDocument(uid, snapshot.data() as FirestoreUserRecord);
}

export async function syncUserWithFirestore(authUser: Pick<DecodedIdToken, "uid" | "email">) {
  const db = createFirebaseAdminDb();
  if (!db) {
    throw new Error("Firebase Admin is not configured.");
  }

  const userRef = db.collection("users").doc(authUser.uid);
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(userRef);
    const existing = snapshot.data() as FirestoreUserRecord | undefined;
    const email = authUser.email || (typeof existing?.email === "string" ? existing.email : null);

    if (!snapshot.exists) {
      transaction.set(userRef, {
        createdAt: FieldValue.serverTimestamp(),
        email,
        role: "user",
        uid: authUser.uid
      });
      return;
    }

    const updates: Record<string, unknown> = {
      uid: authUser.uid
    };

    if (email && email !== existing?.email) {
      updates.email = email;
    }

    if (!existing?.createdAt) {
      updates.createdAt = FieldValue.serverTimestamp();
    }

    if (!["admin", "user"].includes(String(existing?.role))) {
      updates.role = "user";
    }

    if (Object.keys(updates).length) {
      transaction.set(userRef, updates, { merge: true });
    }
  });

  const profile = await getUserByUid(authUser.uid);
  if (!profile) {
    throw new Error("Could not sync Firebase user profile.");
  }

  return profile;
}

export async function createSessionFromIdToken(idToken: string) {
  const adminAuth = createFirebaseAdminAuth();
  if (!adminAuth) {
    throw new Error("Firebase Admin is not configured.");
  }

  const decoded = await adminAuth.verifyIdToken(idToken);
  const user = await syncUserWithFirestore(decoded);
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_MAX_AGE_SECONDS * 1000
  });

  return { sessionCookie, user };
}

export function attachSessionCookie(response: NextResponse, sessionCookie: string) {
  response.cookies.set(AUTH_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

async function getCurrentUserFromCookie(sessionCookie?: string | null) {
  const adminAuth = createFirebaseAdminAuth();
  if (!adminAuth || !sessionCookie) {
    return null;
  }

  try {
    const claims = await adminAuth.verifySessionCookie(sessionCookie, true);
    let user = await getUserByUid(claims.uid);

    if (!user) {
      user = await syncUserWithFirestore(claims);
    }

    return { claims, user };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const session = await getCurrentUserFromCookie(cookieStore.get(AUTH_COOKIE_NAME)?.value);

  return session?.user || null;
}

export async function getCurrentUserFromRequest(request: NextRequest) {
  return getCurrentUserFromCookie(request.cookies.get(AUTH_COOKIE_NAME)?.value);
}

export async function requireAdminRequest(request: NextRequest): Promise<GuardSuccess | GuardFailure> {
  const session = await getCurrentUserFromRequest(request);

  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Authentication required." }, { status: 401 })
    };
  }

  if (session.user.role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized: admin role required." }, { status: 403 })
    };
  }

  return {
    claims: session.claims,
    ok: true,
    user: session.user
  };
}
