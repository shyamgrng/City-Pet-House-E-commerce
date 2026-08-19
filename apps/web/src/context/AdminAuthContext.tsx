"use client";

import { createContext, useContext, useEffect, useState } from "react";

type AdminUser = { name: string; email: string; role: string };

const DEMO_USER: AdminUser = { name: "Admin User", email: "admin@citypethouse.com", role: "Admin" };
const DEMO_PASSWORD = "admin123";
const STORAGE_KEY = "cph_admin_session";

function safeParseUser(raw: string): AdminUser | null {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

type AdminAuthValue = {
  user: AdminUser | null;
  ready: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<{ user: AdminUser | null; ready: boolean }>({ user: null, ready: false });

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // Reading localStorage on mount to hydrate the session is inherently a one-time
    // synchronous read from an external source — there is no external event to subscribe to.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession({ user: stored ? safeParseUser(stored) : null, ready: true });
  }, []);

  const login = (email: string, password: string) => {
    if (email.trim().toLowerCase() === DEMO_USER.email && password === DEMO_PASSWORD) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_USER));
      setSession({ user: DEMO_USER, ready: true });
      return true;
    }
    return false;
  };

  const logout = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setSession((s) => ({ ...s, user: null }));
  };

  return (
    <AdminAuthContext.Provider value={{ user: session.user, ready: session.ready, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
