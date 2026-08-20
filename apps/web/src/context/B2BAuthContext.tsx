"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { b2bAccountSeed, type B2BAccount } from "@/lib/b2b-auth-types";

const SESSION_KEY = "cph_b2b_session_id";
const OVERRIDES_KEY = "cph_b2b_account_overrides";

type Result = { ok: true } | { ok: false; error: string };
type Overrides = Record<string, Partial<Pick<B2BAccount, "password" | "phone" | "altPhone" | "address">>>;

type B2BAuthValue = {
  supplier: B2BAccount | null;
  ready: boolean;
  signIn: (b2bId: string, password: string) => Result;
  signOut: () => void;
  updateProfile: (patch: { phone: string; altPhone: string; address: string }) => void;
  changePassword: (newPassword: string) => void;
};

const B2BAuthContext = createContext<B2BAuthValue | null>(null);

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
    const accounts = applyOverrides(b2bAccountSeed, loadOverrides());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ accounts, supplier: loadSession(accounts), ready: true });
  }, []);

  const persistOverride = (b2bId: string, patch: Partial<Pick<B2BAccount, "password" | "phone" | "altPhone" | "address">>) => {
    const overrides = loadOverrides();
    overrides[b2bId] = { ...overrides[b2bId], ...patch };
    window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
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
    <B2BAuthContext.Provider value={{ supplier: state.supplier, ready: state.ready, signIn, signOut, updateProfile, changePassword }}>
      {children}
    </B2BAuthContext.Provider>
  );
}

export function useB2BAuth() {
  const ctx = useContext(B2BAuthContext);
  if (!ctx) throw new Error("useB2BAuth must be used within B2BAuthProvider");
  return ctx;
}
