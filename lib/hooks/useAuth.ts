"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import * as authService from "@/lib/services/auth";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.logout);

  const login = useCallback(
    async (email: string, password: string) => {
      const next = await authService.login(email, password);
      setUser(next);
      return next;
    },
    [setUser],
  );

  const register = useCallback(
    async (input: { name: string; email: string; phone: string; password: string }) => {
      const next = await authService.register(input);
      setUser(next);
      return next;
    },
    [setUser],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    clearUser();
  }, [clearUser]);

  return { user, hydrated, isAuthenticated: Boolean(user), login, register, logout };
}

/** Redirects to /login when the user is not signed in (after hydration). */
export function useRequireAuth(redirectTo = "/login") {
  const { user, hydrated } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace(`${redirectTo}?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setReady(true);
  }, [hydrated, user, router, redirectTo]);

  return { user, ready };
}