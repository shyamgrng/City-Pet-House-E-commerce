"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { apiFetch, ApiError } from "@/lib/api";

export interface CourierUser {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  verified: boolean;
}

export interface RegisterCourierInput {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  altPhone?: string;
  address?: string;
  password: string;
}

interface CourierAuthState {
  courier: CourierUser | null;
  accessToken: string | null;
  loading: boolean;
}

interface CourierAuthContextValue extends CourierAuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterCourierInput) => Promise<void>;
  logout: () => Promise<void>;
}

const CourierAuthContext = createContext<CourierAuthContextValue | null>(null);

// A fifth, wholly separate identity from pet-owner/admin/doctor/B2B sessions
// (README §Interactions "two identities" rule, extended per surface).
const STORAGE_KEY = "cph_courier_session";

interface StoredSession {
  accessToken: string;
  refreshToken: string;
  courier: CourierUser;
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

export function CourierAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CourierAuthState>({ courier: null, accessToken: null, loading: true });
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadStoredSession();
    if (stored) {
      setState({ courier: stored.courier, accessToken: stored.accessToken, loading: false });
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
          const session = await apiFetch<StoredSession>("/auth/courier/refresh", {
            method: "POST",
            body: { refreshToken },
          });
          persistSession(session);
          setState({ courier: session.courier, accessToken: session.accessToken, loading: false });
          setRefreshToken(session.refreshToken);
        } catch {
          persistSession(null);
          setState({ courier: null, accessToken: null, loading: false });
          setRefreshToken(null);
        }
      },
      12 * 60 * 1000,
    );
    return () => clearInterval(interval);
  }, [refreshToken]);

  const login = useCallback(async (email: string, password: string) => {
    const session = await apiFetch<StoredSession>("/auth/courier/login", {
      method: "POST",
      body: { email, password },
    });
    persistSession(session);
    setState({ courier: session.courier, accessToken: session.accessToken, loading: false });
    setRefreshToken(session.refreshToken);
  }, []);

  const register = useCallback(async (input: RegisterCourierInput) => {
    const session = await apiFetch<StoredSession>("/auth/courier/register", {
      method: "POST",
      body: input,
    });
    persistSession(session);
    setState({ courier: session.courier, accessToken: session.accessToken, loading: false });
    setRefreshToken(session.refreshToken);
  }, []);

  const logout = useCallback(async () => {
    if (refreshToken) {
      await apiFetch("/auth/courier/logout", { method: "POST", body: { refreshToken } }).catch(() => undefined);
    }
    persistSession(null);
    setState({ courier: null, accessToken: null, loading: false });
    setRefreshToken(null);
  }, [refreshToken]);

  return (
    <CourierAuthContext.Provider value={{ ...state, login, register, logout }}>{children}</CourierAuthContext.Provider>
  );
}

export function useCourierAuth() {
  const ctx = useContext(CourierAuthContext);
  if (!ctx) throw new Error("useCourierAuth must be used within CourierAuthProvider");
  return ctx;
}

export { ApiError };
