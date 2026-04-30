"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { ArrowRight, KeyRound, Loader2, Mail, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/authContext";
import { firebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import type { AuthUser } from "@/lib/auth";

type AuthMode = "sign_in" | "sign_up";

function getFirebaseErrorMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";

  if (code.includes("auth/email-already-in-use")) {
    return "This email already has an account. Log in instead.";
  }

  if (code.includes("auth/invalid-credential") || code.includes("auth/wrong-password")) {
    return "Invalid email or password.";
  }

  if (code.includes("auth/weak-password")) {
    return "Use a password with at least 8 characters.";
  }

  if (code.includes("auth/too-many-requests")) {
    return "Too many attempts. Please try again in a few minutes.";
  }

  return "Authentication failed. Please check your details and try again.";
}

export function AuthPage({ initialMode = "sign_in" }: { initialMode?: AuthMode }) {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isSignup = mode === "sign_up";
  const actionLabel = isSignup ? "Create secure account" : "Login securely";
  const alternate = isSignup ? "Already have an account?" : "New to AviEx?";

  const requirements = useMemo(
    () => [
      "Email/password protected by Firebase Auth",
      "HttpOnly server session after login",
      "Firestore profile synced with role=user",
      "Admin access only after founder promotion"
    ],
    []
  );

  function getSafeNextPath() {
    if (typeof window === "undefined") {
      return "/dashboard";
    }

    const next = new URLSearchParams(window.location.search).get("next");
    return next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  }

  async function createServerSession(idToken: string) {
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ idToken })
    });
    const data = (await response.json()) as { error?: string; user?: AuthUser };

    if (!response.ok || !data.user) {
      throw new Error(data.error || "Could not create a secure server session.");
    }

    return data.user;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (!firebaseAuth || !isFirebaseConfigured) {
      setLoading(false);
      setMessage("Firebase is not configured yet. Add the NEXT_PUBLIC_FIREBASE_* keys.");
      return;
    }

    if (isSignup && password.length < 8) {
      setLoading(false);
      setMessage("Use a password with at least 8 characters.");
      return;
    }

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const credentials = isSignup
        ? await createUserWithEmailAndPassword(firebaseAuth, normalizedEmail, password)
        : await signInWithEmailAndPassword(firebaseAuth, normalizedEmail, password);

      if (isSignup && fullName.trim()) {
        await updateProfile(credentials.user, {
          displayName: fullName.trim()
        });
      }

      const idToken = await credentials.user.getIdToken(true);
      const user = await createServerSession(idToken);
      setUser(user);
      router.push(user.role === "admin" ? getSafeNextPath() : "/dashboard");
      router.refresh();
    } catch (error) {
      if (typeof error === "object" && error && "code" in error) {
        setMessage(getFirebaseErrorMessage(error));
      } else {
        setMessage(error instanceof Error ? error.message : "Authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-aqua">
            <Sparkles className="size-4" />
            Secure hair recovery account
          </div>
          <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
            {isSignup ? "Start your 90-day recovery plan" : "Welcome back to your plan"}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/70">
            Your analysis, progress photos, order history, and guarantee claim status are protected
            behind Firebase Authentication and a server-verified role check.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {requirements.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <ShieldCheck className="mb-3 size-5 text-leaf" />
                <p className="text-sm font-semibold leading-6 text-white/80">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="rounded-2xl p-6 sm:p-8">
          <form onSubmit={submit} className="space-y-5">
            <div>
              <p className="text-sm font-semibold text-aqua">AviEx account</p>
              <h2 className="mt-2 text-3xl font-black">
                {isSignup ? "Create account" : "Login"}
              </h2>
            </div>

            {isSignup ? (
              <label className="block">
                <span className="text-sm font-semibold text-white/75">Full name</span>
                <div className="mt-2 flex min-h-14 items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4">
                  <UserRound className="size-4 text-aqua" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/35"
                    placeholder="Your name"
                  />
                </div>
              </label>
            ) : null}

            <label className="block">
              <span className="text-sm font-semibold text-white/75">Email</span>
              <div className="mt-2 flex min-h-14 items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4">
                <Mail className="size-4 text-aqua" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/35"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-white/75">Password</span>
              <div className="mt-2 flex min-h-14 items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4">
                <KeyRound className="size-4 text-aqua" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/35"
                  minLength={isSignup ? 8 : undefined}
                  placeholder={isSignup ? "At least 8 characters" : "Your password"}
                  required
                />
              </div>
            </label>

            <Button
              type="submit"
              className="min-h-14 w-full rounded-2xl bg-aqua text-base text-ink hover:bg-white"
              disabled={loading}
            >
              {loading ? <Loader2 className="size-5 animate-spin" /> : null}
              {actionLabel}
              {!loading ? <ArrowRight className="size-5" /> : null}
            </Button>
          </form>

          <div className="mt-5 flex flex-col gap-3 text-sm text-white/65 sm:flex-row sm:items-center sm:justify-between">
            <p>{alternate}</p>
            <button
              type="button"
              className="text-left font-bold text-aqua transition hover:text-white"
              onClick={() => {
                setMode(isSignup ? "sign_in" : "sign_up");
                setMessage("");
              }}
            >
              {isSignup ? "Login instead" : "Create account"}
            </button>
          </div>

          <p className="mt-4 text-xs leading-5 text-white/45">
            By continuing, you agree to use AviEx for general hair wellness guidance and consult a
            licensed clinician for medical diagnosis or prescriptions.
          </p>

          {message ? (
            <p className="mt-5 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm leading-6 text-white/75">
              {message}
            </p>
          ) : null}

          <p className="mt-5 text-center text-xs text-white/45">
            Founder? Create a normal account, then promote your Firestore user document to{" "}
            <span className="font-bold text-white">admin</span>.{" "}
            <Link className="font-bold text-aqua" href="/">
              Back home
            </Link>
          </p>
        </Card>
      </div>
    </section>
  );
}
