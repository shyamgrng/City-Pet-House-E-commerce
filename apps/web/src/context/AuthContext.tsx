"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { accountSeed } from "@/lib/account-seed";
import type { Account, RegisterInput } from "@/lib/auth-types";

const ACCOUNTS_KEY = "cph_accounts";
const SESSION_KEY = "cph_current_account_id";

type Result = { ok: true } | { ok: false; error: string };

type AuthValue = {
  user: Account | null;
  accounts: Account[];
  ready: boolean;
  signUp: (input: RegisterInput) => Result;
  signIn: (email: string, password: string) => Result;
  signOut: () => void;
  updateProfile: (patch: Partial<Pick<Account, "name" | "email" | "phone" | "address">>) => void;
  changePassword: (newPassword: string) => void;
};

const AuthContext = createContext<AuthValue | null>(null);

function loadAccounts(): Account[] {
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as Account[]) : accountSeed;
  } catch {
    return accountSeed;
  }
}

function loadSession(accounts: Account[]): Account | null {
  const id = window.localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return accounts.find((a) => a.id === id) ?? null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ accounts: Account[]; user: Account | null; ready: boolean }>({
    accounts: accountSeed,
    user: null,
    ready: false,
  });

  useEffect(() => {
    const accounts = loadAccounts();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ accounts, user: loadSession(accounts), ready: true });
  }, []);

  const persistAccounts = (accounts: Account[]) => {
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  };

  const signUp = (input: RegisterInput): Result => {
    if (state.accounts.some((a) => a.email.toLowerCase() === input.email.toLowerCase())) {
      return { ok: false, error: "An account with this email already exists." };
    }
    const account: Account = { ...input, id: "acc-" + Math.random().toString(36).slice(2, 9), createdAt: Date.now() };
    const accounts = [...state.accounts, account];
    persistAccounts(accounts);
    window.localStorage.setItem(SESSION_KEY, account.id);
    setState({ accounts, user: account, ready: true });
    return { ok: true };
  };

  const signIn = (email: string, password: string): Result => {
    const account = state.accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (!account || account.password !== password) {
      return { ok: false, error: "Incorrect email or password." };
    }
    window.localStorage.setItem(SESSION_KEY, account.id);
    setState((s) => ({ ...s, user: account }));
    return { ok: true };
  };

  const signOut = () => {
    window.localStorage.removeItem(SESSION_KEY);
    setState((s) => ({ ...s, user: null }));
  };

  const updateProfile = (patch: Partial<Pick<Account, "name" | "email" | "phone" | "address">>) => {
    setState((s) => {
      if (!s.user) return s;
      const updated = { ...s.user, ...patch };
      const accounts = s.accounts.map((a) => (a.id === updated.id ? updated : a));
      persistAccounts(accounts);
      return { accounts, user: updated, ready: true };
    });
  };

  const changePassword = (newPassword: string) => {
    setState((s) => {
      if (!s.user) return s;
      const updated = { ...s.user, password: newPassword };
      const accounts = s.accounts.map((a) => (a.id === updated.id ? updated : a));
      persistAccounts(accounts);
      return { accounts, user: updated, ready: true };
    });
  };

  return (
    <AuthContext.Provider
      value={{ user: state.user, accounts: state.accounts, ready: state.ready, signUp, signIn, signOut, updateProfile, changePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
