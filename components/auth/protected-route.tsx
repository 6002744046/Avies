"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import type { UserRole } from "@/lib/auth";
import { useAuth } from "@/context/authContext";

export function ProtectedRoute({
  children,
  redirectTo = "/login",
  requiredRole
}: {
  children: ReactNode;
  redirectTo?: string;
  requiredRole?: UserRole;
}) {
  const router = useRouter();
  const { loading, user } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace(redirectTo);
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      router.replace("/");
    }
  }, [loading, redirectTo, requiredRole, router, user]);

  if (loading || !user || (requiredRole && user.role !== requiredRole)) {
    return null;
  }

  return children;
}
