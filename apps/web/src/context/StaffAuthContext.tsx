"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { notifyEvent } from "@/lib/notify-client";
import { staffAccountSeed, type StaffAccount } from "@/lib/staff-auth-types";

const SESSION_KEY = "cph_staff_session_id";
const OVERRIDES_KEY = "cph_staff_account_overrides";
const ADDED_KEY = "cph_staff_added_accounts";
const REMOVED_KEY = "cph_staff_removed_ids";
const SECURITY_LOG_LIMIT = 20;

type Result = { ok: true } | { ok: false; error: string };
type Overrides = Record<string, Partial<StaffAccount>>;

type StaffAuthValue = {
  staff: StaffAccount | null;
  accounts: StaffAccount[];
  ready: boolean;
  signIn: (staffId: string, password: string) => Result;
  signOut: () => void;
  updateProfile: (patch: { phone: string; address: string; bankName: string; bankAccountHolder: string; bankAccountNumber: string }) => void;
  changePassword: (newPassword: string) => void;
  uploadPhoto: (dataUrl: string) => void;
  /** Creates the account itself -- used once a StaffRegistration is approved, mirroring how
   * doctor/courier/b2b accounts only come into existence after admin approves an application. */
  addAccount: (account: Omit<StaffAccount, "createdAt">) => boolean;
  removeStaff: (staffId: string) => void;
  adminUpdateAccount: (
    staffId: string,
    patch: Partial<
      Pick<
        StaffAccount,
        "name" | "email" | "phone" | "jobTitle" | "address" | "isActive" | "nationalId" | "degreeCertificate" | "nvcCard" | "drivingLicense"
      >
    >
  ) => void;
  adminResetPassword: (staffId: string) => string;
};

const StaffAuthContext = createContext<StaffAuthValue | null>(null);

function loadOverrides(): Overrides {
  try {
    const raw = window.localStorage.getItem(OVERRIDES_KEY);
    return raw ? (JSON.parse(raw) as Overrides) : {};
  } catch {
    return {};
  }
}

function persistOverrides(overrides: Overrides) {
  window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
}

function applyOverrides(accounts: StaffAccount[], overrides: Overrides): StaffAccount[] {
  return accounts.map((a) => ({ ...a, ...overrides[a.staffId] }));
}

function loadSession(accounts: StaffAccount[]): StaffAccount | null {
  const id = window.localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return accounts.find((a) => a.staffId === id) ?? null;
}

function loadAdded(): StaffAccount[] {
  try {
    const raw = window.localStorage.getItem(ADDED_KEY);
    const parsed = raw ? (JSON.parse(raw) as StaffAccount[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistAdded(accounts: StaffAccount[]) {
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

function loadAllAccounts(): StaffAccount[] {
  const removed = new Set(loadRemoved());
  const base = staffAccountSeed.filter((a) => !removed.has(a.staffId));
  const added = loadAdded().filter((a) => !removed.has(a.staffId));
  return applyOverrides([...base, ...added], loadOverrides());
}

export function StaffAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ accounts: StaffAccount[]; staff: StaffAccount | null; ready: boolean }>({
    accounts: staffAccountSeed,
    staff: null,
    ready: false,
  });

  useEffect(() => {
    const accounts = loadAllAccounts();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ accounts, staff: loadSession(accounts), ready: true });
  }, []);

  const persistOverride = (staffId: string, patch: Partial<StaffAccount>) => {
    const overrides = loadOverrides();
    overrides[staffId] = { ...overrides[staffId], ...patch };
    persistOverrides(overrides);
  };

  const logSecurity = (a: StaffAccount, text: string): StaffAccount => ({
    ...a,
    securityLog: [...(a.securityLog ?? []), { text, time: Date.now() }].slice(-SECURITY_LOG_LIMIT),
  });

  const addAccount = (account: Omit<StaffAccount, "createdAt">): boolean => {
    const full: StaffAccount = { ...account, createdAt: Date.now() };
    const added = [...loadAdded(), full];
    persistAdded(added);
    setState((s) => ({ ...s, accounts: [...s.accounts, full] }));
    return true;
  };

  const removeStaff = (staffId: string) => {
    const removed = [...loadRemoved(), staffId];
    persistRemoved(removed);
    setState((s) => ({ ...s, accounts: s.accounts.filter((a) => a.staffId !== staffId) }));
  };

  const signIn = (staffId: string, password: string): Result => {
    const account = state.accounts.find((a) => a.staffId.toLowerCase() === staffId.trim().toLowerCase());
    if (!account || account.password !== password) {
      return { ok: false, error: "Incorrect Staff ID or password." };
    }
    if (!account.isActive) {
      return { ok: false, error: "This account has been deactivated. Contact your admin." };
    }
    window.localStorage.setItem(SESSION_KEY, account.staffId);
    const updated = logSecurity(account, "Signed in");
    persistOverride(account.staffId, { securityLog: updated.securityLog });
    const accounts = state.accounts.map((a) => (a.staffId === updated.staffId ? updated : a));
    setState((s) => ({ ...s, accounts, staff: updated }));
    return { ok: true };
  };

  const signOut = () => {
    window.localStorage.removeItem(SESSION_KEY);
    setState((s) => ({ ...s, staff: null }));
  };

  const updateProfile = (patch: { phone: string; address: string; bankName: string; bankAccountHolder: string; bankAccountNumber: string }) => {
    setState((s) => {
      if (!s.staff) return s;
      persistOverride(s.staff.staffId, patch);
      const updated = { ...s.staff, ...patch };
      const accounts = s.accounts.map((a) => (a.staffId === updated.staffId ? updated : a));
      return { accounts, staff: updated, ready: true };
    });
  };

  const changePassword = (newPassword: string) => {
    setState((s) => {
      if (!s.staff) return s;
      const patch = { password: newPassword, mustChangePassword: false };
      persistOverride(s.staff.staffId, patch);
      const updated = { ...s.staff, ...patch };
      const accounts = s.accounts.map((a) => (a.staffId === updated.staffId ? updated : a));
      return { accounts, staff: updated, ready: true };
    });
  };

  const uploadPhoto = (dataUrl: string) => {
    setState((s) => {
      if (!s.staff) return s;
      persistOverride(s.staff.staffId, { photo: dataUrl });
      const updated = { ...s.staff, photo: dataUrl };
      const accounts = s.accounts.map((a) => (a.staffId === updated.staffId ? updated : a));
      return { accounts, staff: updated, ready: true };
    });
  };

  const adminUpdateAccount = (
    staffId: string,
    patch: Partial<
      Pick<
        StaffAccount,
        "name" | "email" | "phone" | "jobTitle" | "address" | "isActive" | "nationalId" | "degreeCertificate" | "nvcCard" | "drivingLicense"
      >
    >
  ) => {
    persistOverride(staffId, patch);
    setState((s) => ({
      ...s,
      accounts: s.accounts.map((a) => (a.staffId === staffId ? { ...a, ...patch } : a)),
      staff: s.staff?.staffId === staffId ? { ...s.staff, ...patch } : s.staff,
    }));
  };

  const adminResetPassword = (staffId: string): string => {
    const tempPassword = "cph" + Math.floor(1000 + Math.random() * 9000);
    const account = state.accounts.find((a) => a.staffId === staffId);
    const patch = { password: tempPassword, mustChangePassword: true };
    persistOverride(staffId, patch);
    setState((s) => ({ ...s, accounts: s.accounts.map((a) => (a.staffId === staffId ? { ...a, ...patch } : a)) }));
    if (account?.email) notifyEvent("forgot_password", account.email, account.name, { name: account.name, code: tempPassword });
    return tempPassword;
  };

  return (
    <StaffAuthContext.Provider
      value={{
        staff: state.staff,
        accounts: state.accounts,
        ready: state.ready,
        signIn,
        signOut,
        updateProfile,
        changePassword,
        uploadPhoto,
        addAccount,
        removeStaff,
        adminUpdateAccount,
        adminResetPassword,
      }}
    >
      {children}
    </StaffAuthContext.Provider>
  );
}

export function useStaffAuth() {
  const ctx = useContext(StaffAuthContext);
  if (!ctx) throw new Error("useStaffAuth must be used within StaffAuthProvider");
  return ctx;
}
