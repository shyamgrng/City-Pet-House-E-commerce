"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { apiFetch, ApiError } from "@/lib/api";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: Record<string, boolean>;
}

interface AdminAuthState {
  admin: AdminUser | null;
  accessToken: string | null;
  loading: boolean;
}

interface AdminAuthContextValue extends AdminAuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

// Deliberately a different storage key from the pet-owner session
// (cph_owner_session) — staff sign-in and pet-owner sign-in are two
// identities that must never toggle each other (README §Interactions).
const STORAGE_KEY = "cph_admin_session";

interface StoredSession {
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
}

function loadStoredSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

function persistSession(session: StoredSession | null) {
  if (typeof window === "undefined") return;
  if (session) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  else window.localStorage.removeItem(STORAGE_KEY);
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminAuthState>({ admin: null, accessToken: null, loading: true });
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadStoredSession();
    if (stored) {
      setState({ admin: stored.user, accessToken: stored.accessToken, loading: false });
      setRefreshToken(stored.refreshToken);
    } else {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  useEffect(() => {
    if (!refreshToken) return;
    const interval = setInterval(
      async () => {
        try {
          const session = await apiFetch<StoredSession>("/auth/admin/refresh", {
            method: "POST",
            body: { refreshToken },
          });
          persistSession(session);
          setState({ admin: session.user, accessToken: session.accessToken, loading: false });
          setRefreshToken(session.refreshToken);
        } catch {
          persistSession(null);
          setState({ admin: null, accessToken: null, loading: false });
          setRefreshToken(null);
        }
      },
      12 * 60 * 1000,
    );
    return () => clearInterval(interval);
  }, [refreshToken]);

  const login = useCallback(async (email: string, password: string) => {
    const session = await apiFetch<StoredSession>("/auth/admin/login", {
      method: "POST",
      body: { email, password },
    });
    persistSession(session);
    setState({ admin: session.user, accessToken: session.accessToken, loading: false });
    setRefreshToken(session.refreshToken);
  }, []);

  const logout = useCallback(async () => {
    if (refreshToken) {
      await apiFetch("/auth/admin/logout", { method: "POST", body: { refreshToken } }).catch(() => undefined);
    }
    persistSession(null);
    setState({ admin: null, accessToken: null, loading: false });
    setRefreshToken(null);
  }, [refreshToken]);

  return (
    <AdminAuthContext.Provider value={{ ...state, login, logout }}>{children}</AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}

export { ApiError };
