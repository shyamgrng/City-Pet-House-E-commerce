"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { notifyEvent } from "@/lib/notify-client";
import { staffAccountSeed, type DocumentAcknowledgment, type IssuedDocument, type StaffAccount } from "@/lib/staff-auth-types";

const SESSION_KEY = "cph_staff_session_id";
const OVERRIDES_KEY = "cph_staff_account_overrides";
const ADDED_KEY = "cph_staff_added_accounts";
const REMOVED_KEY = "cph_staff_removed_ids";
const SECURITY_LOG_LIMIT = 20;
const STORAGE_FULL_MESSAGE =
  "Couldn't save — your browser's storage is full. Delete an old photo or video somewhere on the site to free up space, then try again.";

type Result = { ok: true } | { ok: false; error: string };
type Overrides = Record<string, Partial<StaffAccount>>;

type StaffAuthValue = {
  staff: StaffAccount | null;
  accounts: StaffAccount[];
  ready: boolean;
  saveError: string | null;
  signIn: (staffId: string, password: string) => Result;
  signOut: () => void;
  updateProfile: (patch: { phone: string; address: string; bankName: string; bankAccountHolder: string; bankAccountNumber: string }) => void;
  changePassword: (newPassword: string) => void;
  uploadPhoto: (dataUrl: string) => void;
  uploadDocument: (field: "nationalId" | "degreeCertificate" | "nvcCard" | "drivingLicense", dataUrl: string) => void;
  /** Staff confirms their required documents are all in -- a clear "done" signal separate from
   * the individual uploads, which save immediately on their own. */
  submitDocuments: () => void;
  /** Records one signature that covers every currently-unsigned issued document at once -- a
   * single checklist/date/signature for the whole batch, not one sign-off per document. Returns
   * whether it actually saved, so the caller doesn't show "signed" on a silent storage failure. */
  acknowledgeDocuments: (docIds: string[], signatureDataUrl: string) => boolean;
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
  /** Phase 2 -- admin sends a letter/form to the staff member (appointment letter, job
   * description, VOC letter, or any other form) and emails them that it's ready to view. */
  adminIssueDocument: (staffId: string, label: string, fileUrl: string) => void;
  adminRemoveIssuedDocument: (staffId: string, docId: string) => void;
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

function loadRemoved(): string[] {
  try {
    const raw = window.localStorage.getItem(REMOVED_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Backfills fields introduced after an account may have been saved to localStorage by an older
// build, so previously-created staff accounts don't crash the newer UI (e.g. issuedDocuments.map).
function normalizeStaff(
  a: Omit<StaffAccount, "issuedDocuments" | "acknowledgments"> & { issuedDocuments?: IssuedDocument[]; acknowledgments?: DocumentAcknowledgment[] }
): StaffAccount {
  return { issuedDocuments: [], acknowledgments: [], ...a };
}

function loadAllAccounts(): StaffAccount[] {
  const removed = new Set(loadRemoved());
  const base = staffAccountSeed.filter((a) => !removed.has(a.staffId));
  const added = loadAdded().filter((a) => !removed.has(a.staffId));
  return applyOverrides([...base, ...added].map(normalizeStaff), loadOverrides());
}

export function StaffAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ accounts: StaffAccount[]; staff: StaffAccount | null; ready: boolean; saveError: string | null }>({
    accounts: staffAccountSeed,
    staff: null,
    ready: false,
    saveError: null,
  });

  useEffect(() => {
    const accounts = loadAllAccounts();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ accounts, staff: loadSession(accounts), ready: true, saveError: null });
  }, []);

  // Self-contained: its own try/catch and its own single setState call for the failure path, so a
  // quota-exceeded error can never be thrown from inside a caller's setState updater (which React
  // treats as a render-phase error and crashes to the error page instead of just failing this one
  // save). Every mutator below calls this BEFORE its own setState, never from inside one.
  const persistOverride = (staffId: string, patch: Partial<StaffAccount>): boolean => {
    const overrides = loadOverrides();
    overrides[staffId] = { ...overrides[staffId], ...patch };
    try {
      window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
    } catch {
      setState((s) => ({ ...s, saveError: STORAGE_FULL_MESSAGE }));
      return false;
    }
    return true;
  };

  const persistAdded = (accounts: StaffAccount[]): boolean => {
    try {
      window.localStorage.setItem(ADDED_KEY, JSON.stringify(accounts));
    } catch {
      setState((s) => ({ ...s, saveError: STORAGE_FULL_MESSAGE }));
      return false;
    }
    return true;
  };

  const persistRemoved = (ids: string[]): boolean => {
    try {
      window.localStorage.setItem(REMOVED_KEY, JSON.stringify(ids));
    } catch {
      setState((s) => ({ ...s, saveError: STORAGE_FULL_MESSAGE }));
      return false;
    }
    return true;
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
      issuedDocuments: [],
      acknowledgments: [],
    };
    const ok = persistAdded([...loadAdded(), account]);
    if (ok) setState((s) => ({ ...s, accounts: [...s.accounts, account], saveError: null }));
    return { staffId, password };
  };

  const removeStaff = (staffId: string) => {
    const ok = persistRemoved([...loadRemoved(), staffId]);
    if (!ok) return;
    setState((s) => ({ ...s, accounts: s.accounts.filter((a) => a.staffId !== staffId), saveError: null }));
  };

  const signIn = (staffId: string, password: string): Result => {
    const account = state.accounts.find((a) => a.staffId.toLowerCase() === staffId.trim().toLowerCase());
    if (!account || account.password !== password) {
      return { ok: false, error: "Incorrect Staff ID or password." };
    }
    if (!account.isActive) {
      return { ok: false, error: "This account has been deactivated. Contact your admin." };
    }
    const updated = logSecurity(account, "Signed in");
    const ok = persistOverride(account.staffId, { securityLog: updated.securityLog });
    window.localStorage.setItem(SESSION_KEY, account.staffId);
    const accounts = state.accounts.map((a) => (a.staffId === updated.staffId ? updated : a));
    setState((s) => ({ ...s, accounts, staff: updated, saveError: ok ? s.saveError : STORAGE_FULL_MESSAGE }));
    return { ok: true };
  };

  const signOut = () => {
    window.localStorage.removeItem(SESSION_KEY);
    setState((s) => ({ ...s, staff: null }));
  };

  const updateProfile = (patch: { phone: string; address: string; bankName: string; bankAccountHolder: string; bankAccountNumber: string }) => {
    if (!state.staff) return;
    const ok = persistOverride(state.staff.staffId, patch);
    if (!ok) return;
    setState((s) => {
      if (!s.staff) return s;
      const updated = { ...s.staff, ...patch };
      const accounts = s.accounts.map((a) => (a.staffId === updated.staffId ? updated : a));
      return { accounts, staff: updated, ready: true, saveError: null };
    });
  };

  const changePassword = (newPassword: string) => {
    if (!state.staff) return;
    const patch = { password: newPassword, mustChangePassword: false };
    const ok = persistOverride(state.staff.staffId, patch);
    if (!ok) return;
    setState((s) => {
      if (!s.staff) return s;
      const updated = { ...s.staff, ...patch };
      const accounts = s.accounts.map((a) => (a.staffId === updated.staffId ? updated : a));
      return { accounts, staff: updated, ready: true, saveError: null };
    });
  };

  const uploadPhoto = (dataUrl: string) => {
    if (!state.staff) return;
    const ok = persistOverride(state.staff.staffId, { photo: dataUrl });
    if (!ok) return;
    setState((s) => {
      if (!s.staff) return s;
      const updated = { ...s.staff, photo: dataUrl };
      const accounts = s.accounts.map((a) => (a.staffId === updated.staffId ? updated : a));
      return { accounts, staff: updated, ready: true, saveError: null };
    });
  };

  const uploadDocument = (field: "nationalId" | "degreeCertificate" | "nvcCard" | "drivingLicense", dataUrl: string) => {
    if (!state.staff) return;
    // Replacing a document after submitting needs a fresh confirmation, so clear it here.
    const patch = { [field]: dataUrl, documentsSubmittedAt: undefined };
    const ok = persistOverride(state.staff.staffId, patch);
    if (!ok) return;
    setState((s) => {
      if (!s.staff) return s;
      const updated = { ...s.staff, ...patch };
      const accounts = s.accounts.map((a) => (a.staffId === updated.staffId ? updated : a));
      return { accounts, staff: updated, ready: true, saveError: null };
    });
  };

  const submitDocuments = () => {
    if (!state.staff) return;
    const patch = { documentsSubmittedAt: Date.now() };
    const ok = persistOverride(state.staff.staffId, patch);
    if (!ok) return;
    setState((s) => {
      if (!s.staff) return s;
      const updated = { ...s.staff, ...patch };
      const accounts = s.accounts.map((a) => (a.staffId === updated.staffId ? updated : a));
      return { accounts, staff: updated, ready: true, saveError: null };
    });
  };

  const acknowledgeDocuments = (docIds: string[], signatureDataUrl: string): boolean => {
    if (!state.staff || docIds.length === 0) return false;
    const record: DocumentAcknowledgment = {
      signatureDataUrl,
      agreedAt: Date.now(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      documentIds: docIds,
    };
    const acknowledgments = [...state.staff.acknowledgments, record];
    const ok = persistOverride(state.staff.staffId, { acknowledgments });
    if (!ok) return false;
    setState((s) => {
      if (!s.staff) return s;
      const updated = { ...s.staff, acknowledgments };
      const accounts = s.accounts.map((a) => (a.staffId === updated.staffId ? updated : a));
      return { accounts, staff: updated, ready: true, saveError: null };
    });
    return true;
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
    const ok = persistOverride(staffId, patch);
    if (!ok) return;
    setState((s) => ({
      ...s,
      accounts: s.accounts.map((a) => (a.staffId === staffId ? { ...a, ...patch } : a)),
      staff: s.staff?.staffId === staffId ? { ...s.staff, ...patch } : s.staff,
      saveError: null,
    }));
  };

  const adminResetPassword = (staffId: string): string => {
    const tempPassword = "cph" + Math.floor(1000 + Math.random() * 9000);
    const account = state.accounts.find((a) => a.staffId === staffId);
    const patch = { password: tempPassword, mustChangePassword: true };
    const ok = persistOverride(staffId, patch);
    if (ok) {
      setState((s) => ({ ...s, accounts: s.accounts.map((a) => (a.staffId === staffId ? { ...a, ...patch } : a)), saveError: null }));
      if (account?.email) notifyEvent("forgot_password", account.email, account.name, { name: account.name, code: tempPassword });
    }
    return tempPassword;
  };

  const adminIssueDocument = (staffId: string, label: string, fileUrl: string) => {
    const account = state.accounts.find((a) => a.staffId === staffId);
    if (!account) return;
    const doc: IssuedDocument = { id: "doc-" + Math.random().toString(36).slice(2, 9), label, fileUrl, issuedAt: Date.now() };
    const issuedDocuments = [...account.issuedDocuments, doc];
    const ok = persistOverride(staffId, { issuedDocuments });
    if (!ok) return;
    setState((s) => ({ ...s, accounts: s.accounts.map((a) => (a.staffId === staffId ? { ...a, issuedDocuments } : a)), saveError: null }));
    if (account.email) notifyEvent("staff_document_issued", account.email, account.name, { name: account.name, label });
  };

  const adminRemoveIssuedDocument = (staffId: string, docId: string) => {
    const account = state.accounts.find((a) => a.staffId === staffId);
    if (!account) return;
    const issuedDocuments = account.issuedDocuments.filter((d) => d.id !== docId);
    const ok = persistOverride(staffId, { issuedDocuments });
    if (!ok) return;
    setState((s) => ({ ...s, accounts: s.accounts.map((a) => (a.staffId === staffId ? { ...a, issuedDocuments } : a)), saveError: null }));
  };

  return (
    <StaffAuthContext.Provider
      value={{
        staff: state.staff,
        accounts: state.accounts,
        ready: state.ready,
        saveError: state.saveError,
        signIn,
        signOut,
        updateProfile,
        changePassword,
        uploadPhoto,
        uploadDocument,
        submitDocuments,
        acknowledgeDocuments,
        addStaff,
        removeStaff,
        adminUpdateAccount,
        adminResetPassword,
        adminIssueDocument,
        adminRemoveIssuedDocument,
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
