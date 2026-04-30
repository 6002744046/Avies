"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type { AuthUser } from "@/lib/auth";

type AuthContextValue = {
  loading: boolean;
  refreshUser: () => Promise<AuthUser | null>;
  setUser: (user: AuthUser | null) => void;
  user: AuthUser | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchCurrentUser() {
  const response = await fetch("/api/auth/me", {
    cache: "no-store"
  });
  const data = (await response.json()) as { user: AuthUser | null };

  return data.user;
}

export function AuthProvider({
  children,
  initialUser
}: {
  children: ReactNode;
  initialUser: AuthUser | null;
}) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser);

  const refreshUser = useCallback(async () => {
    setLoading(true);

    try {
      const nextUser = await fetchCurrentUser();
      setUser(nextUser);

      return nextUser;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    if (!initialUser) {
      void fetchCurrentUser()
        .then((nextUser) => {
          if (active) {
            setUser(nextUser);
          }
        })
        .catch(() => {
          if (active) {
            setUser(null);
          }
        })
        .finally(() => {
          if (active) {
            setLoading(false);
          }
        });
    }

    return () => {
      active = false;
    };
  }, [initialUser]);

  const value = useMemo(
    () => ({
      loading,
      refreshUser,
      setUser,
      user
    }),
    [loading, refreshUser, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
