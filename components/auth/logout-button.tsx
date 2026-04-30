"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { firebaseAuth } from "@/lib/firebase";

export function LogoutButton() {
  const router = useRouter();
  const { setUser } = useAuth();

  async function logout() {
    if (firebaseAuth) {
      await signOut(firebaseAuth);
    }

    await fetch("/api/auth/logout", {
      method: "POST"
    });

    setUser(null);
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
    className="inline-flex h-10 items-center gap-2 rounded-2xl px-3 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
  >
      <LogOut className="size-4" />
      <span className="hidden sm:inline">Logout</span>
    </button>
  );
}
