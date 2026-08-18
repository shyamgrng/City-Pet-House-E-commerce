"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { apiFetch, ApiError } from "@/lib/api";

export interface B2BSupplier {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  commissionPct: number;
  verified: boolean;
}

export interface RegisterB2BInput {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  altPhone?: string;
  address?: string;
  categories?: string[];
  password: string;
}

interface B2BAuthState {
  supplier: B2BSupplier | null;
  accessToken: string | null;
  loading: boolean;
}

interface B2BAuthContextValue extends B2BAuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterB2BInput) => Promise<void>;
  logout: () => Promise<void>;
}

const B2BAuthContext = createContext<B2BAuthContextValue | null>(null);

// A fourth, wholly separate identity from pet-owner/admin/doctor sessions
// (README §Interactions "two identities" rule, extended per surface).
const STORAGE_KEY = "cph_b2b_session";

interface StoredSession {
  accessToken: string;
  refreshToken: string;
  supplier: B2BSupplier;
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

export function B2BAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<B2BAuthState>({ supplier: null, accessToken: null, loading: true });
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadStoredSession();
    if (stored) {
      setState({ supplier: stored.supplier, accessToken: stored.accessToken, loading: false });
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
          const session = await apiFetch<StoredSession>("/auth/b2b/refresh", {
            method: "POST",
            body: { refreshToken },
          });
          persistSession(session);
          setState({ supplier: session.supplier, accessToken: session.accessToken, loading: false });
          setRefreshToken(session.refreshToken);
        } catch {
          persistSession(null);
          setState({ supplier: null, accessToken: null, loading: false });
          setRefreshToken(null);
        }
      },
      12 * 60 * 1000,
    );
    return () => clearInterval(interval);
  }, [refreshToken]);

  const login = useCallback(async (email: string, password: string) => {
    const session = await apiFetch<StoredSession>("/auth/b2b/login", {
      method: "POST",
      body: { email, password },
    });
    persistSession(session);
    setState({ supplier: session.supplier, accessToken: session.accessToken, loading: false });
    setRefreshToken(session.refreshToken);
  }, []);

  const register = useCallback(async (input: RegisterB2BInput) => {
    const session = await apiFetch<StoredSession>("/auth/b2b/register", {
      method: "POST",
      body: input,
    });
    persistSession(session);
    setState({ supplier: session.supplier, accessToken: session.accessToken, loading: false });
    setRefreshToken(session.refreshToken);
  }, []);

  const logout = useCallback(async () => {
    if (refreshToken) {
      await apiFetch("/auth/b2b/logout", { method: "POST", body: { refreshToken } }).catch(() => undefined);
    }
    persistSession(null);
    setState({ supplier: null, accessToken: null, loading: false });
    setRefreshToken(null);
  }, [refreshToken]);

  return (
    <B2BAuthContext.Provider value={{ ...state, login, register, logout }}>{children}</B2BAuthContext.Provider>
  );
}

export function useB2BAuth() {
  const ctx = useContext(B2BAuthContext);
  if (!ctx) throw new Error("useB2BAuth must be used within B2BAuthProvider");
  return ctx;
}

export { ApiError };
