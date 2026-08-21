"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { notifyEvent } from "@/lib/notify-client";
import { courierAccountSeed, type CourierAccount } from "@/lib/courier-auth-types";

const SESSION_KEY = "cph_courier_session_id";
const OVERRIDES_KEY = "cph_courier_account_overrides";
const RESETS_KEY = "cph_courier_password_resets";
const RESET_CODE_TTL_MS = 15 * 60 * 1000;

type Result = { ok: true } | { ok: false; error: string };
type Overrides = Record<string, Partial<Pick<CourierAccount, "password" | "phone" | "altPhone" | "address">>>;
type ResetRecord = { code: string; expiresAt: number };

type CourierAuthValue = {
  courier: CourierAccount | null;
  ready: boolean;
  signIn: (courierId: string, password: string) => Result;
  signOut: () => void;
  updateProfile: (patch: { phone: string; altPhone: string; address: string }) => void;
  changePassword: (newPassword: string) => void;
  requestPasswordReset: (courierId: string) => Result;
  resetPassword: (courierId: string, code: string, newPassword: string) => Result;
};

const CourierAuthContext = createContext<CourierAuthValue | null>(null);

function loadResets(): Record<string, ResetRecord> {
  try {
    const raw = window.localStorage.getItem(RESETS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, ResetRecord>) : {};
  } catch {
    return {};
  }
}

function persistResets(resets: Record<string, ResetRecord>) {
  window.localStorage.setItem(RESETS_KEY, JSON.stringify(resets));
}

function loadOverrides(): Overrides {
  try {
    const raw = window.localStorage.getItem(OVERRIDES_KEY);
    return raw ? (JSON.parse(raw) as Overrides) : {};
  } catch {
    return {};
  }
}

function applyOverrides(accounts: CourierAccount[], overrides: Overrides): CourierAccount[] {
  return accounts.map((a) => ({ ...a, ...overrides[a.courierId] }));
}

function loadSession(accounts: CourierAccount[]): CourierAccount | null {
  const id = window.localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return accounts.find((a) => a.courierId === id) ?? null;
}

export function CourierAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ accounts: CourierAccount[]; courier: CourierAccount | null; ready: boolean }>({
    accounts: courierAccountSeed,
    courier: null,
    ready: false,
  });

  useEffect(() => {
    const accounts = applyOverrides(courierAccountSeed, loadOverrides());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ accounts, courier: loadSession(accounts), ready: true });
  }, []);

  const persistOverride = (courierId: string, patch: Partial<Pick<CourierAccount, "password" | "phone" | "altPhone" | "address">>) => {
    const overrides = loadOverrides();
    overrides[courierId] = { ...overrides[courierId], ...patch };
    window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
  };

  const requestPasswordReset = (courierId: string): Result => {
    const account = state.accounts.find((a) => a.courierId.toLowerCase() === courierId.trim().toLowerCase());
    if (!account) return { ok: false, error: "No courier account found with that ID." };
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const resets = loadResets();
    resets[account.courierId] = { code, expiresAt: Date.now() + RESET_CODE_TTL_MS };
    persistResets(resets);
    notifyEvent("forgot_password", account.email, account.companyName, { name: account.companyName, code });
    return { ok: true };
  };

  const resetPassword = (courierId: string, code: string, newPassword: string): Result => {
    const resets = loadResets();
    const account = state.accounts.find((a) => a.courierId.toLowerCase() === courierId.trim().toLowerCase());
    if (!account) return { ok: false, error: "No courier account found with that ID." };
    const record = resets[account.courierId];
    if (!record || record.code !== code.trim()) return { ok: false, error: "Incorrect or expired code." };
    if (Date.now() > record.expiresAt) return { ok: false, error: "This code has expired — request a new one." };
    persistOverride(account.courierId, { password: newPassword });
    const updated = { ...account, password: newPassword };
    const accounts = state.accounts.map((a) => (a.courierId === updated.courierId ? updated : a));
    setState((s) => ({ ...s, accounts }));
    delete resets[account.courierId];
    persistResets(resets);
    return { ok: true };
  };

  const signIn = (courierId: string, password: string): Result => {
    const account = state.accounts.find((a) => a.courierId.toLowerCase() === courierId.trim().toLowerCase());
    if (!account || account.password !== password) {
      return { ok: false, error: "Incorrect Courier ID or password." };
    }
    window.localStorage.setItem(SESSION_KEY, account.courierId);
    setState((s) => ({ ...s, courier: account }));
    return { ok: true };
  };

  const signOut = () => {
    window.localStorage.removeItem(SESSION_KEY);
    setState((s) => ({ ...s, courier: null }));
  };

  const updateProfile = (patch: { phone: string; altPhone: string; address: string }) => {
    setState((s) => {
      if (!s.courier) return s;
      persistOverride(s.courier.courierId, patch);
      const updated = { ...s.courier, ...patch };
      const accounts = s.accounts.map((a) => (a.courierId === updated.courierId ? updated : a));
      return { accounts, courier: updated, ready: true };
    });
  };

  const changePassword = (newPassword: string) => {
    setState((s) => {
      if (!s.courier) return s;
      persistOverride(s.courier.courierId, { password: newPassword });
      const updated = { ...s.courier, password: newPassword };
      const accounts = s.accounts.map((a) => (a.courierId === updated.courierId ? updated : a));
      return { accounts, courier: updated, ready: true };
    });
  };

  return (
    <CourierAuthContext.Provider
      value={{ courier: state.courier, ready: state.ready, signIn, signOut, updateProfile, changePassword, requestPasswordReset, resetPassword }}
    >
      {children}
    </CourierAuthContext.Provider>
  );
}

export function useCourierAuth() {
  const ctx = useContext(CourierAuthContext);
  if (!ctx) throw new Error("useCourierAuth must be used within CourierAuthProvider");
  return ctx;
}
