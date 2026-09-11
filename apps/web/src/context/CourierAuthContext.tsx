"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { generateTempPassword } from "@/lib/doctor-registration-types";
import { notifyEvent } from "@/lib/notify-client";
import { courierAccountSeed, type CourierAccount } from "@/lib/courier-auth-types";

const SESSION_KEY = "cph_courier_session_id";
const OVERRIDES_KEY = "cph_courier_account_overrides";
const RESETS_KEY = "cph_courier_password_resets";
const ADDED_KEY = "cph_courier_added_accounts";
const REMOVED_KEY = "cph_courier_removed_ids";
const RESET_CODE_TTL_MS = 15 * 60 * 1000;
const SECURITY_LOG_LIMIT = 200;

type Result = { ok: true } | { ok: false; error: string };
type Overrides = Record<
  string,
  Partial<
    Pick<
      CourierAccount,
      | "password"
      | "phone"
      | "altPhone"
      | "address"
      | "priceSmall"
      | "priceMedium"
      | "priceLarge"
      | "priceVeryLarge"
      | "usesDistancePricing"
      | "ratePerKg"
      | "ratePerKm"
      | "defaultFlatPrice"
      | "isActive"
      | "companyName"
      | "contactPerson"
      | "email"
      | "businessDocument"
      | "ownerIdDocument"
      | "mustChangePassword"
      | "securityLog"
    >
  >
>;
type ResetRecord = { code: string; expiresAt: number };

// Backfills fields introduced after this record may have been saved to localStorage by an
// older build, so previously-saved courier accounts don't crash the new field-reading UI.
function normalizeCourier(
  a: Partial<CourierAccount> & Pick<CourierAccount, "courierId" | "companyName" | "password" | "email" | "phone" | "altPhone" | "address">
): CourierAccount {
  return {
    priceSmall: 0,
    priceMedium: 0,
    priceLarge: 0,
    priceVeryLarge: 0,
    usesDistancePricing: false,
    ratePerKg: 0,
    ratePerKm: 0,
    defaultFlatPrice: 0,
    isActive: false,
    ...a,
  };
}

type CourierAuthValue = {
  courier: CourierAccount | null;
  accounts: CourierAccount[];
  ready: boolean;
  signIn: (courierId: string, password: string) => Result;
  signOut: () => void;
  updateProfile: (patch: Partial<Pick<CourierAccount, "companyName" | "contactPerson" | "email" | "phone" | "altPhone" | "address">>) => void;
  updateDocument: (field: "businessDocument" | "ownerIdDocument", value: string) => void;
  changePassword: (newPassword: string) => void;
  requestPasswordReset: (courierId: string) => Result;
  resetPassword: (courierId: string, code: string, newPassword: string) => Result;
  addCourier: (
    input: Omit<CourierAccount, "courierId" | "password" | "email"> & { email?: string }
  ) => { courierId: string; password: string };
  removeCourier: (courierId: string) => void;
  setActiveCourier: (courierId: string) => void;
  adminUpdateAccount: (
    courierId: string,
    patch: Partial<
      Pick<CourierAccount, "companyName" | "contactPerson" | "email" | "phone" | "altPhone" | "address" | "businessDocument" | "ownerIdDocument">
    >,
  ) => void;
  adminResetPassword: (courierId: string) => Result;
  adminSetPassword: (courierId: string, newPassword: string) => Result;
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

function loadAdded(): CourierAccount[] {
  try {
    const raw = window.localStorage.getItem(ADDED_KEY);
    const parsed = raw ? (JSON.parse(raw) as CourierAccount[]) : [];
    return Array.isArray(parsed) ? parsed.map(normalizeCourier) : [];
  } catch {
    return [];
  }
}

function persistAdded(accounts: CourierAccount[]) {
  window.localStorage.setItem(ADDED_KEY, JSON.stringify(accounts));
}

function loadRemoved(): string[] {
  try {
    const raw = window.localStorage.getItem(REMOVED_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistRemoved(ids: string[]) {
  window.localStorage.setItem(REMOVED_KEY, JSON.stringify(ids));
}

function loadAllAccounts(): CourierAccount[] {
  const removed = new Set(loadRemoved());
  const base = courierAccountSeed.map(normalizeCourier).filter((a) => !removed.has(a.courierId));
  const added = loadAdded().filter((a) => !removed.has(a.courierId));
  return applyOverrides([...base, ...added], loadOverrides());
}

export function CourierAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ accounts: CourierAccount[]; courier: CourierAccount | null; ready: boolean }>({
    accounts: courierAccountSeed,
    courier: null,
    ready: false,
  });

  useEffect(() => {
    const accounts = loadAllAccounts();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ accounts, courier: loadSession(accounts), ready: true });
  }, []);

  const persistOverride = (courierId: string, patch: Partial<Overrides[string]>) => {
    const overrides = loadOverrides();
    overrides[courierId] = { ...overrides[courierId], ...patch };
    window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
  };

  const addCourier = (input: Omit<CourierAccount, "courierId" | "password" | "email"> & { email?: string }) => {
    const courierId = "CR-" + Math.floor(2000 + Math.random() * 8000);
    const password = "cph" + Math.floor(1000 + Math.random() * 9000);
    const account: CourierAccount = {
      ...input,
      courierId,
      password,
      email: input.email ?? "",
    };
    const added = [...loadAdded(), account];
    persistAdded(added);
    setState((s) => ({ ...s, accounts: [...s.accounts, account] }));
    return { courierId, password };
  };

  const removeCourier = (courierId: string) => {
    const removed = [...loadRemoved(), courierId];
    persistRemoved(removed);
    setState((s) => ({ ...s, accounts: s.accounts.filter((a) => a.courierId !== courierId) }));
  };

  const setActiveCourier = (courierId: string) => {
    setState((s) => {
      const accounts = s.accounts.map((a) => {
        const isActive = a.courierId === courierId;
        persistOverride(a.courierId, { isActive });
        return { ...a, isActive };
      });
      return { ...s, accounts };
    });
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
    const securityLog = [...(account.securityLog ?? []), { text: "Signed in", time: Date.now() }].slice(-SECURITY_LOG_LIMIT);
    persistOverride(account.courierId, { securityLog });
    const updated = { ...account, securityLog };
    setState((s) => ({ ...s, courier: updated, accounts: s.accounts.map((a) => (a.courierId === updated.courierId ? updated : a)) }));
    return { ok: true };
  };

  const signOut = () => {
    window.localStorage.removeItem(SESSION_KEY);
    setState((s) => ({ ...s, courier: null }));
  };

  const updateProfile = (patch: Partial<Pick<CourierAccount, "companyName" | "contactPerson" | "email" | "phone" | "altPhone" | "address">>) => {
    setState((s) => {
      if (!s.courier) return s;
      persistOverride(s.courier.courierId, patch);
      const updated = { ...s.courier, ...patch };
      const accounts = s.accounts.map((a) => (a.courierId === updated.courierId ? updated : a));
      return { accounts, courier: updated, ready: true };
    });
  };

  const updateDocument = (field: "businessDocument" | "ownerIdDocument", value: string) => {
    setState((s) => {
      if (!s.courier) return s;
      persistOverride(s.courier.courierId, { [field]: value });
      const updated = { ...s.courier, [field]: value };
      const accounts = s.accounts.map((a) => (a.courierId === updated.courierId ? updated : a));
      return { accounts, courier: updated, ready: true };
    });
  };

  const changePassword = (newPassword: string) => {
    setState((s) => {
      if (!s.courier) return s;
      const securityLog = [...(s.courier.securityLog ?? []), { text: "Changed password", time: Date.now() }].slice(-SECURITY_LOG_LIMIT);
      persistOverride(s.courier.courierId, { password: newPassword, mustChangePassword: false, securityLog });
      const updated = { ...s.courier, password: newPassword, mustChangePassword: false, securityLog };
      const accounts = s.accounts.map((a) => (a.courierId === updated.courierId ? updated : a));
      return { accounts, courier: updated, ready: true };
    });
  };

  const adminUpdateAccount = (
    courierId: string,
    patch: Partial<
      Pick<CourierAccount, "companyName" | "contactPerson" | "email" | "phone" | "altPhone" | "address" | "businessDocument" | "ownerIdDocument">
    >,
  ) => {
    persistOverride(courierId, patch);
    setState((s) => ({ ...s, accounts: s.accounts.map((a) => (a.courierId === courierId ? { ...a, ...patch } : a)) }));
  };

  const adminResetPassword = (courierId: string): Result => {
    const account = state.accounts.find((a) => a.courierId === courierId);
    if (!account) return { ok: false, error: "Courier account not found." };
    const tempPassword = generateTempPassword();
    const securityLog = [...(account.securityLog ?? []), { text: "Admin reset password (temporary password emailed)", time: Date.now() }].slice(
      -SECURITY_LOG_LIMIT,
    );
    persistOverride(courierId, { password: tempPassword, mustChangePassword: true, securityLog });
    setState((s) => ({
      ...s,
      accounts: s.accounts.map((a) => (a.courierId === courierId ? { ...a, password: tempPassword, mustChangePassword: true, securityLog } : a)),
    }));
    notifyEvent("admin_password_reset", account.email, account.companyName, { name: account.companyName, tempPassword });
    return { ok: true };
  };

  const adminSetPassword = (courierId: string, newPassword: string): Result => {
    const account = state.accounts.find((a) => a.courierId === courierId);
    if (!account) return { ok: false, error: "Courier account not found." };
    if (!newPassword.trim()) return { ok: false, error: "Enter a password." };
    const securityLog = [...(account.securityLog ?? []), { text: "Admin set a new password directly", time: Date.now() }].slice(-SECURITY_LOG_LIMIT);
    persistOverride(courierId, { password: newPassword, mustChangePassword: true, securityLog });
    setState((s) => ({
      ...s,
      accounts: s.accounts.map((a) => (a.courierId === courierId ? { ...a, password: newPassword, mustChangePassword: true, securityLog } : a)),
    }));
    return { ok: true };
  };

  return (
    <CourierAuthContext.Provider
      value={{
        courier: state.courier,
        accounts: state.accounts,
        ready: state.ready,
        signIn,
        signOut,
        updateProfile,
        updateDocument,
        changePassword,
        requestPasswordReset,
        resetPassword,
        addCourier,
        removeCourier,
        setActiveCourier,
        adminUpdateAccount,
        adminResetPassword,
        adminSetPassword,
      }}
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
