"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { accountSeed } from "@/lib/account-seed";
import { notifyEvent } from "@/lib/notify-client";
import type { Account, RegisterInput, SavedAddress } from "@/lib/auth-types";

const ACCOUNTS_KEY = "cph_accounts";
const SESSION_KEY = "cph_current_account_id";
const RESETS_KEY = "cph_password_resets";
const RESET_CODE_TTL_MS = 15 * 60 * 1000;

type Result = { ok: true } | { ok: false; error: string };
type ResetRecord = { code: string; expiresAt: number };

type AuthValue = {
  user: Account | null;
  accounts: Account[];
  ready: boolean;
  signUp: (input: RegisterInput) => Result;
  signIn: (email: string, password: string) => Result;
  signOut: () => void;
  updateProfile: (patch: Partial<Pick<Account, "name" | "email" | "phone" | "address">>) => void;
  changePassword: (newPassword: string) => void;
  requestPasswordReset: (email: string) => Result;
  resetPassword: (email: string, code: string, newPassword: string) => Result;
  addAddress: (label: string, line: string) => void;
  updateAddress: (id: string, patch: Partial<Pick<SavedAddress, "label" | "line">>) => void;
  removeAddress: (id: string) => void;
  setPrimaryAddress: (id: string) => void;
};

const AuthContext = createContext<AuthValue | null>(null);

// Backfills the saved-addresses book for an account created before that feature existed,
// seeding it with a single entry that mirrors the account's existing address field.
function normalizeAccount(a: Account): Account {
  if (a.addresses && a.addresses.length > 0 && a.primaryAddressId) return a;
  const id = "addr-" + Math.random().toString(36).slice(2, 9);
  return { ...a, addresses: [{ id, label: "Home", line: a.address }], primaryAddressId: id };
}

function loadAccounts(): Account[] {
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    const accounts = raw ? (JSON.parse(raw) as Account[]) : accountSeed;
    return accounts.map(normalizeAccount);
  } catch {
    return accountSeed.map(normalizeAccount);
  }
}

function loadSession(accounts: Account[]): Account | null {
  const id = window.localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return accounts.find((a) => a.id === id) ?? null;
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
    const email = input.email.trim();
    if (state.accounts.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: "An account with this email already exists." };
    }
    const addressId = "addr-" + Math.random().toString(36).slice(2, 9);
    const account: Account = {
      ...input,
      email,
      id: "acc-" + Math.random().toString(36).slice(2, 9),
      createdAt: Date.now(),
      addresses: [{ id: addressId, label: "Home", line: input.address }],
      primaryAddressId: addressId,
    };
    const accounts = [...state.accounts, account];
    persistAccounts(accounts);
    window.localStorage.setItem(SESSION_KEY, account.id);
    setState({ accounts, user: account, ready: true });
    notifyEvent("account_created", account.email, account.name, { name: account.name });
    return { ok: true };
  };

  const requestPasswordReset = (email: string): Result => {
    const account = state.accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (!account) return { ok: false, error: "No account found with that email." };
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const resets = loadResets();
    resets[account.email.toLowerCase()] = { code, expiresAt: Date.now() + RESET_CODE_TTL_MS };
    persistResets(resets);
    notifyEvent("forgot_password", account.email, account.name, { name: account.name, code });
    return { ok: true };
  };

  const resetPassword = (email: string, code: string, newPassword: string): Result => {
    const resets = loadResets();
    const key = email.toLowerCase();
    const record = resets[key];
    if (!record || record.code !== code.trim()) return { ok: false, error: "Incorrect or expired code." };
    if (Date.now() > record.expiresAt) return { ok: false, error: "This code has expired — request a new one." };
    const account = state.accounts.find((a) => a.email.toLowerCase() === key);
    if (!account) return { ok: false, error: "No account found with that email." };
    const updated = { ...account, password: newPassword };
    const accounts = state.accounts.map((a) => (a.id === updated.id ? updated : a));
    persistAccounts(accounts);
    delete resets[key];
    persistResets(resets);
    setState((s) => ({ ...s, accounts }));
    return { ok: true };
  };

  const signIn = (email: string, password: string): Result => {
    const account = state.accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
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

  const addAddress = (label: string, line: string) => {
    setState((s) => {
      if (!s.user) return s;
      const entry: SavedAddress = { id: "addr-" + Math.random().toString(36).slice(2, 9), label, line };
      const updated = { ...s.user, addresses: [...s.user.addresses, entry] };
      const accounts = s.accounts.map((a) => (a.id === updated.id ? updated : a));
      persistAccounts(accounts);
      return { accounts, user: updated, ready: true };
    });
  };

  const updateAddress = (id: string, patch: Partial<Pick<SavedAddress, "label" | "line">>) => {
    setState((s) => {
      if (!s.user) return s;
      const addresses = s.user.addresses.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry));
      // Keep the top-level `address` field (the one every other page reads) in sync when the primary entry's line changes.
      const address = id === s.user.primaryAddressId && patch.line !== undefined ? patch.line : s.user.address;
      const updated = { ...s.user, addresses, address };
      const accounts = s.accounts.map((a) => (a.id === updated.id ? updated : a));
      persistAccounts(accounts);
      return { accounts, user: updated, ready: true };
    });
  };

  const removeAddress = (id: string) => {
    setState((s) => {
      if (!s.user) return s;
      // Always keep at least one saved address so there's never a moment with no primary.
      if (s.user.addresses.length <= 1) return s;
      const addresses = s.user.addresses.filter((entry) => entry.id !== id);
      const stillPrimary = addresses.find((entry) => entry.id === s.user!.primaryAddressId);
      const primaryAddressId = stillPrimary ? s.user.primaryAddressId : addresses[0].id;
      const address = stillPrimary ? s.user.address : addresses[0].line;
      const updated = { ...s.user, addresses, primaryAddressId, address };
      const accounts = s.accounts.map((a) => (a.id === updated.id ? updated : a));
      persistAccounts(accounts);
      return { accounts, user: updated, ready: true };
    });
  };

  const setPrimaryAddress = (id: string) => {
    setState((s) => {
      if (!s.user) return s;
      const entry = s.user.addresses.find((a) => a.id === id);
      if (!entry) return s;
      const updated = { ...s.user, primaryAddressId: id, address: entry.line };
      const accounts = s.accounts.map((a) => (a.id === updated.id ? updated : a));
      persistAccounts(accounts);
      return { accounts, user: updated, ready: true };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        accounts: state.accounts,
        ready: state.ready,
        signUp,
        signIn,
        signOut,
        updateProfile,
        changePassword,
        requestPasswordReset,
        resetPassword,
        addAddress,
        updateAddress,
        removeAddress,
        setPrimaryAddress,
      }}
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
