"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { apiFetch, ApiError } from "@/lib/api";

export interface DoctorUser {
  id: string;
  displayName: string;
  email: string;
  qualification: string | null;
  consultFee: number;
  isOnline: boolean;
}

interface DoctorAuthState {
  doctor: DoctorUser | null;
  accessToken: string | null;
  loading: boolean;
}

interface DoctorAuthContextValue extends DoctorAuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setDoctor: (doctor: DoctorUser) => void;
}

const DoctorAuthContext = createContext<DoctorAuthContextValue | null>(null);

// Deliberately a different storage key from the pet-owner (cph_owner_session)
// and admin/staff (cph_admin_session) sessions — doctor sign-in is a third,
// wholly separate identity (README §Interactions).
const STORAGE_KEY = "cph_doctor_session";

interface StoredSession {
  accessToken: string;
  refreshToken: string;
  doctor: DoctorUser;
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

export function DoctorAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DoctorAuthState>({ doctor: null, accessToken: null, loading: true });
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadStoredSession();
    if (stored) {
      setState({ doctor: stored.doctor, accessToken: stored.accessToken, loading: false });
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
          const session = await apiFetch<StoredSession>("/auth/doctor/refresh", {
            method: "POST",
            body: { refreshToken },
          });
          persistSession(session);
          setState({ doctor: session.doctor, accessToken: session.accessToken, loading: false });
          setRefreshToken(session.refreshToken);
        } catch {
          persistSession(null);
          setState({ doctor: null, accessToken: null, loading: false });
          setRefreshToken(null);
        }
      },
      12 * 60 * 1000,
    );
    return () => clearInterval(interval);
  }, [refreshToken]);

  const login = useCallback(async (email: string, password: string) => {
    const session = await apiFetch<StoredSession>("/auth/doctor/login", {
      method: "POST",
      body: { email, password },
    });
    persistSession(session);
    setState({ doctor: session.doctor, accessToken: session.accessToken, loading: false });
    setRefreshToken(session.refreshToken);
  }, []);

  const logout = useCallback(async () => {
    if (refreshToken) {
      await apiFetch("/auth/doctor/logout", { method: "POST", body: { refreshToken } }).catch(() => undefined);
    }
    persistSession(null);
    setState({ doctor: null, accessToken: null, loading: false });
    setRefreshToken(null);
  }, [refreshToken]);

  const setDoctor = useCallback((doctor: DoctorUser) => {
    setState((s) => ({ ...s, doctor }));
  }, []);

  return (
    <DoctorAuthContext.Provider value={{ ...state, login, logout, setDoctor }}>{children}</DoctorAuthContext.Provider>
  );
}

export function useDoctorAuth() {
  const ctx = useContext(DoctorAuthContext);
  if (!ctx) throw new Error("useDoctorAuth must be used within DoctorAuthProvider");
  return ctx;
}

export { ApiError };
