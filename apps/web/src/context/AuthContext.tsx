"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { getDeviceKey } from "@/lib/device-key";

interface OwnerUser {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: OwnerUser | null;
  accessToken: string | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "cph_owner_session";

interface StoredSession {
  accessToken: string;
  refreshToken: string;
  user: OwnerUser;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, accessToken: null, loading: true });
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadStoredSession();
    if (stored) {
      setState({ user: stored.user, accessToken: stored.accessToken, loading: false });
      setRefreshToken(stored.refreshToken);
    } else {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  // Access tokens are short-lived (15 min); refresh proactively so a session
  // doesn't silently die mid-checkout.
  useEffect(() => {
    if (!refreshToken) return;
    const interval = setInterval(
      async () => {
        try {
          const session = await apiFetch<StoredSession>("/auth/owner/refresh", {
            method: "POST",
            body: { refreshToken },
          });
          persistSession(session);
          setState({ user: session.user, accessToken: session.accessToken, loading: false });
          setRefreshToken(session.refreshToken);
        } catch {
          persistSession(null);
          setState({ user: null, accessToken: null, loading: false });
          setRefreshToken(null);
        }
      },
      12 * 60 * 1000,
    );
    return () => clearInterval(interval);
  }, [refreshToken]);

  const applySession = useCallback(async (session: StoredSession) => {
    persistSession(session);
    // Cart survives sign-in: fold the anonymous device cart into the owner's
    // cart *before* flipping state, so CartContext's fetch (triggered by the
    // accessToken change below) sees the merged cart, not a race with it.
    try {
      await apiFetch("/auth/owner/merge-cart", {
        method: "POST",
        accessToken: session.accessToken,
        body: { deviceKey: getDeviceKey() },
      });
    } catch {
      // non-fatal — the device cart just won't merge this time
    }
    setState({ user: session.user, accessToken: session.accessToken, loading: false });
    setRefreshToken(session.refreshToken);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const session = await apiFetch<StoredSession>("/auth/owner/login", {
        method: "POST",
        body: { email, password },
      });
      await applySession(session);
    },
    [applySession],
  );

  const register = useCallback(
    async (name: string, email: string, phone: string, password: string) => {
      const session = await apiFetch<StoredSession>("/auth/owner/register", {
        method: "POST",
        body: { name, email, phone, password },
      });
      await applySession(session);
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    if (refreshToken) {
      await apiFetch("/auth/owner/logout", { method: "POST", body: { refreshToken } }).catch(() => undefined);
    }
    persistSession(null);
    setState({ user: null, accessToken: null, loading: false });
    setRefreshToken(null);
  }, [refreshToken]);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { ApiError };
