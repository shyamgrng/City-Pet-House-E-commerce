"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { notifyEvent } from "@/lib/notify-client";
import { b2bAccountSeed, type B2BAccount } from "@/lib/b2b-auth-types";

const SESSION_KEY = "cph_b2b_session_id";
const OVERRIDES_KEY = "cph_b2b_account_overrides";
const RESETS_KEY = "cph_b2b_password_resets";
const ADDED_KEY = "cph_b2b_added_accounts";
const RESET_CODE_TTL_MS = 15 * 60 * 1000;

type Result = { ok: true } | { ok: false; error: string };
type Overrides = Record<string, Partial<Pick<B2BAccount, "password" | "phone" | "altPhone" | "address">>>;
type ResetRecord = { code: string; expiresAt: number };

type B2BAuthValue = {
  supplier: B2BAccount | null;
  accounts: B2BAccount[];
  ready: boolean;
  signIn: (b2bId: string, password: string) => Result;
  signOut: () => void;
  updateProfile: (patch: { phone: string; altPhone: string; address: string }) => void;
  changePassword: (newPassword: string) => void;
  requestPasswordReset: (b2bId: string) => Result;
  resetPassword: (b2bId: string, code: string, newPassword: string) => Result;
  addSupplier: (input: Omit<B2BAccount, "b2bId" | "password">) => { b2bId: string; password: string };
};

const B2BAuthContext = createContext<B2BAuthValue | null>(null);

function loadAdded(): B2BAccount[] {
  try {
    const raw = window.localStorage.getItem(ADDED_KEY);
    const parsed = raw ? (JSON.parse(raw) as B2BAccount[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistAdded(accounts: B2BAccount[]) {
  window.localStorage.setItem(ADDED_KEY, JSON.stringify(accounts));
}

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

function applyOverrides(accounts: B2BAccount[], overrides: Overrides): B2BAccount[] {
  return accounts.map((a) => ({ ...a, ...overrides[a.b2bId] }));
}

function loadSession(accounts: B2BAccount[]): B2BAccount | null {
  const id = window.localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return accounts.find((a) => a.b2bId === id) ?? null;
}

export function B2BAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ accounts: B2BAccount[]; supplier: B2BAccount | null; ready: boolean }>({
    accounts: b2bAccountSeed,
    supplier: null,
    ready: false,
  });

  useEffect(() => {
    const accounts = applyOverrides([...b2bAccountSeed, ...loadAdded()], loadOverrides());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ accounts, supplier: loadSession(accounts), ready: true });
  }, []);

  const persistOverride = (b2bId: string, patch: Partial<Pick<B2BAccount, "password" | "phone" | "altPhone" | "address">>) => {
    const overrides = loadOverrides();
    overrides[b2bId] = { ...overrides[b2bId], ...patch };
    window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
  };

  const addSupplier = (input: Omit<B2BAccount, "b2bId" | "password">) => {
    const b2bId = "B2B-" + Math.floor(2000 + Math.random() * 8000);
    const password = "cph" + Math.floor(1000 + Math.random() * 9000);
    const account: B2BAccount = { ...input, b2bId, password };
    const added = [...loadAdded(), account];
    persistAdded(added);
    setState((s) => ({ ...s, accounts: [...s.accounts, account] }));
    return { b2bId, password };
  };

  const requestPasswordReset = (b2bId: string): Result => {
    const account = state.accounts.find((a) => a.b2bId.toLowerCase() === b2bId.trim().toLowerCase());
    if (!account) return { ok: false, error: "No B2B account found with that ID." };
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const resets = loadResets();
    resets[account.b2bId] = { code, expiresAt: Date.now() + RESET_CODE_TTL_MS };
    persistResets(resets);
    notifyEvent("forgot_password", account.email, account.contactPerson, { name: account.contactPerson, code });
    return { ok: true };
  };

  const resetPassword = (b2bId: string, code: string, newPassword: string): Result => {
    const resets = loadResets();
    const account = state.accounts.find((a) => a.b2bId.toLowerCase() === b2bId.trim().toLowerCase());
    if (!account) return { ok: false, error: "No B2B account found with that ID." };
    const record = resets[account.b2bId];
    if (!record || record.code !== code.trim()) return { ok: false, error: "Incorrect or expired code." };
    if (Date.now() > record.expiresAt) return { ok: false, error: "This code has expired — request a new one." };
    persistOverride(account.b2bId, { password: newPassword });
    const updated = { ...account, password: newPassword };
    const accounts = state.accounts.map((a) => (a.b2bId === updated.b2bId ? updated : a));
    setState((s) => ({ ...s, accounts }));
    delete resets[account.b2bId];
    persistResets(resets);
    return { ok: true };
  };

  const signIn = (b2bId: string, password: string): Result => {
    const account = state.accounts.find((a) => a.b2bId.toLowerCase() === b2bId.trim().toLowerCase());
    if (!account || account.password !== password) {
      return { ok: false, error: "Incorrect B2B ID or password." };
    }
    window.localStorage.setItem(SESSION_KEY, account.b2bId);
    setState((s) => ({ ...s, supplier: account }));
    return { ok: true };
  };

  const signOut = () => {
    window.localStorage.removeItem(SESSION_KEY);
    setState((s) => ({ ...s, supplier: null }));
  };

  const updateProfile = (patch: { phone: string; altPhone: string; address: string }) => {
    setState((s) => {
      if (!s.supplier) return s;
      persistOverride(s.supplier.b2bId, patch);
      const updated = { ...s.supplier, ...patch };
      const accounts = s.accounts.map((a) => (a.b2bId === updated.b2bId ? updated : a));
      return { accounts, supplier: updated, ready: true };
    });
  };

  const changePassword = (newPassword: string) => {
    setState((s) => {
      if (!s.supplier) return s;
      persistOverride(s.supplier.b2bId, { password: newPassword });
      const updated = { ...s.supplier, password: newPassword };
      const accounts = s.accounts.map((a) => (a.b2bId === updated.b2bId ? updated : a));
      return { accounts, supplier: updated, ready: true };
    });
  };

  return (
    <B2BAuthContext.Provider
      value={{
        supplier: state.supplier,
        accounts: state.accounts,
        ready: state.ready,
        signIn,
        signOut,
        updateProfile,
        changePassword,
        requestPasswordReset,
        resetPassword,
        addSupplier,
      }}
    >
      {children}
    </B2BAuthContext.Provider>
  );
}

export function useB2BAuth() {
  const ctx = useContext(B2BAuthContext);
  if (!ctx) throw new Error("useB2BAuth must be used within B2BAuthProvider");
  return ctx;
}
