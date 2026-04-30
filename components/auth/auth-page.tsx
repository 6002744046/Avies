"use client";

import { FormEvent, useState } from "react";
import { KeyRound, Loader2, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export function AuthPage() {
  const [email, setEmail] = useState("founder@aviex.ai");
  const [password, setPassword] = useState("demo-password");
  const [mode, setMode] = useState<"sign_in" | "sign_up">("sign_in");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setMessage("Demo mode: add Supabase keys to enable secure email/password auth.");
      setLoading(false);
      return;
    }

    const result =
      mode === "sign_in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (result.error) {
      setMessage(result.error.message);
    } else {
      setMessage(mode === "sign_in" ? "Signed in successfully." : "Check your email to confirm the account.");
    }

    setLoading(false);
  }

  async function sendOtp() {
    setLoading(true);
    setMessage("");
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      setMessage("Demo mode: add Supabase keys to enable OTP magic links.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined
      }
    });

    setMessage(error ? error.message : "Magic link sent. Check your email.");
    setLoading(false);
  }

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase text-aqua">Secure sessions</p>
          <h1 className="mt-3 text-4xl font-black md:text-6xl">Login to manage your recovery plan</h1>
          <p className="mt-5 max-w-xl text-white/70">
            Supabase handles authenticated sessions, order history, progress uploads, and guarantee claims.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              ["Email/password", "Fast returning-user access"],
              ["OTP magic link", "Passwordless optional login"],
              ["Private uploads", "Storage-backed photo tracking"],
              ["Admin review", "Refund decisions stay auditable"]
            ].map(([title, copy]) => (
              <div key={title} className="rounded-lg border border-white/10 bg-white/10 p-4">
                <ShieldCheck className="mb-3 size-5 text-leaf" />
                <p className="font-black">{title}</p>
                <p className="mt-1 text-sm text-white/50">{copy}</p>
              </div>
            ))}
          </div>
        </div>

        <Card>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <p className="text-sm text-white/50">AviEx account</p>
              <h2 className="mt-2 text-3xl font-black">
                {mode === "sign_in" ? "Welcome back" : "Create account"}
              </h2>
            </div>
            <label className="block">
              <span className="text-sm font-semibold text-white/70">Email</span>
              <div className="mt-2 flex items-center gap-3 rounded-lg border border-white/10 bg-white/10 px-4 py-3">
                <Mail className="size-4 text-aqua" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-white outline-none"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-white/70">Password</span>
              <div className="mt-2 flex items-center gap-3 rounded-lg border border-white/10 bg-white/10 px-4 py-3">
                <KeyRound className="size-4 text-aqua" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-white outline-none"
                />
              </div>
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="submit" className="bg-aqua text-ink hover:bg-white" disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : null}
                {mode === "sign_in" ? "Login" : "Sign up"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setMode(mode === "sign_in" ? "sign_up" : "sign_in")}
              >
                {mode === "sign_in" ? "Create account" : "Use login"}
              </Button>
            </div>
            <Button type="button" variant="secondary" className="w-full" onClick={sendOtp} disabled={loading}>
              <Mail className="size-4" /> Send OTP magic link
            </Button>
          </form>
          {message ? (
            <p className="mt-5 rounded-lg border border-white/10 bg-white/10 p-4 text-sm text-white/70">
              {message}
            </p>
          ) : null}
        </Card>
      </div>
    </section>
  );
}
