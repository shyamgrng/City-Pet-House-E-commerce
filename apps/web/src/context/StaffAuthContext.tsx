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
  uploadDocument: (field: "nationalId" | "degreeCertificate" | "nvcCard" | "drivingLicense", dataUrl: string) => void;
  /** Admin creates the account directly and emails the new hire a login link with a temporary
   * password -- staff never self-register. Returns the generated credentials so the caller can
   * send that email and show them on-screen as a fallback. */
  addStaff: (input: { name: string; email: string; phone: string; jobTitle: string }) => { staffId: string; password: string };
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

  const addStaff = (input: { name: string; email: string; phone: string; jobTitle: string }): { staffId: string; password: string } => {
    const staffId = "ST-" + Math.floor(2000 + Math.random() * 8000);
    const password = "cph" + Math.floor(1000 + Math.random() * 9000);
    const account: StaffAccount = {
      staffId,
      password,
      name: input.name,
      email: input.email,
      phone: input.phone,
      jobTitle: input.jobTitle,
      address: "",
      photo: "",
      nationalId: "",
      degreeCertificate: "",
      nvcCard: "",
      drivingLicense: "",
      isActive: true,
      mustChangePassword: true,
      createdAt: Date.now(),
    };
    const added = [...loadAdded(), account];
    persistAdded(added);
    setState((s) => ({ ...s, accounts: [...s.accounts, account] }));
    return { staffId, password };
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

  const uploadDocument = (field: "nationalId" | "degreeCertificate" | "nvcCard" | "drivingLicense", dataUrl: string) => {
    setState((s) => {
      if (!s.staff) return s;
      persistOverride(s.staff.staffId, { [field]: dataUrl });
      const updated = { ...s.staff, [field]: dataUrl };
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
        uploadDocument,
        addStaff,
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
