"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { notifyEvent } from "@/lib/notify-client";
import { doctorAccountSeed, type DoctorAccount } from "@/lib/doctor-auth-types";

const ACCOUNTS_KEY = "cph_doctor_accounts";
const SESSION_KEY = "cph_doctor_session_id";
const RESETS_KEY = "cph_doctor_password_resets";
const RESET_CODE_TTL_MS = 15 * 60 * 1000;
const STORAGE_FULL_MESSAGE =
  "Couldn't save — your browser's storage is full. Delete an old photo or video somewhere on the site to free up space, then try again.";

type Result = { ok: true } | { ok: false; error: string };
type ResetRecord = { code: string; expiresAt: number };

type DoctorAuthValue = {
  doctor: DoctorAccount | null;
  accounts: DoctorAccount[];
  ready: boolean;
  saveError: string | null;
  signIn: (doctorId: string, password: string) => Result;
  signOut: () => void;
  updateAddress: (address: string) => void;
  updatePhoto: (photo: string) => void;
  changePassword: (newPassword: string) => void;
  requestPasswordReset: (doctorId: string) => Result;
  resetPassword: (doctorId: string, code: string, newPassword: string) => Result;
  addAccount: (account: DoctorAccount) => boolean;
};

const DoctorAuthContext = createContext<DoctorAuthValue | null>(null);

function loadAccounts(): DoctorAccount[] {
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as DoctorAccount[]) : doctorAccountSeed;
  } catch {
    return doctorAccountSeed;
  }
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
  try {
    window.localStorage.setItem(RESETS_KEY, JSON.stringify(resets));
  } catch {
    // Reset codes are short-lived and non-critical -- drop silently if storage is full.
  }
}

function loadSession(accounts: DoctorAccount[]): DoctorAccount | null {
  const id = window.localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return accounts.find((d) => d.doctorId === id) ?? null;
}

export function DoctorAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ accounts: DoctorAccount[]; doctor: DoctorAccount | null; ready: boolean; saveError: string | null }>({
    accounts: doctorAccountSeed,
    doctor: null,
    ready: false,
    saveError: null,
  });

  useEffect(() => {
    const accounts = loadAccounts();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ accounts, doctor: loadSession(accounts), ready: true, saveError: null });
  }, []);

  // Self-contained: its own try/catch and its own single setState call, so a quota-exceeded
  // error can't be thrown from inside a caller's setState updater (which React treats as a
  // render-phase error and crashes to the error page instead of just failing the one save).
  const persistAccounts = (accounts: DoctorAccount[]): boolean => {
    try {
      window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch {
      setState((s) => ({ ...s, saveError: STORAGE_FULL_MESSAGE }));
      return false;
    }
    setState((s) => ({
      ...s,
      accounts,
      doctor: s.doctor ? (accounts.find((a) => a.doctorId === s.doctor!.doctorId) ?? null) : s.doctor,
      saveError: null,
    }));
    return true;
  };

  const requestPasswordReset = (doctorId: string): Result => {
    const account = state.accounts.find((d) => d.doctorId.toLowerCase() === doctorId.trim().toLowerCase());
    if (!account) return { ok: false, error: "No doctor account found with that ID." };
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const resets = loadResets();
    resets[account.doctorId] = { code, expiresAt: Date.now() + RESET_CODE_TTL_MS };
    persistResets(resets);
    notifyEvent("forgot_password", account.email, account.name, { name: account.name, code });
    return { ok: true };
  };

  const resetPassword = (doctorId: string, code: string, newPassword: string): Result => {
    const resets = loadResets();
    const account = state.accounts.find((d) => d.doctorId.toLowerCase() === doctorId.trim().toLowerCase());
    if (!account) return { ok: false, error: "No doctor account found with that ID." };
    const record = resets[account.doctorId];
    if (!record || record.code !== code.trim()) return { ok: false, error: "Incorrect or expired code." };
    if (Date.now() > record.expiresAt) return { ok: false, error: "This code has expired — request a new one." };
    persistAccounts(state.accounts.map((a) => (a.doctorId === account.doctorId ? { ...a, password: newPassword } : a)));
    delete resets[account.doctorId];
    persistResets(resets);
    return { ok: true };
  };

  const signIn = (doctorId: string, password: string): Result => {
    const account = state.accounts.find((d) => d.doctorId.toLowerCase() === doctorId.trim().toLowerCase());
    if (!account || account.password !== password) {
      return { ok: false, error: "Incorrect Doctor ID or password." };
    }
    window.localStorage.setItem(SESSION_KEY, account.doctorId);
    setState((s) => ({ ...s, doctor: account }));
    return { ok: true };
  };

  const signOut = () => {
    window.localStorage.removeItem(SESSION_KEY);
    setState((s) => ({ ...s, doctor: null }));
  };

  const updateAddress = (address: string) => {
    if (!state.doctor) return;
    const doctorId = state.doctor.doctorId;
    persistAccounts(state.accounts.map((a) => (a.doctorId === doctorId ? { ...a, address } : a)));
  };

  const updatePhoto = (photo: string) => {
    if (!state.doctor) return;
    const doctorId = state.doctor.doctorId;
    persistAccounts(state.accounts.map((a) => (a.doctorId === doctorId ? { ...a, photo } : a)));
  };

  const changePassword = (newPassword: string) => {
    if (!state.doctor) return;
    const doctorId = state.doctor.doctorId;
    persistAccounts(state.accounts.map((a) => (a.doctorId === doctorId ? { ...a, password: newPassword } : a)));
  };

  const addAccount = (account: DoctorAccount): boolean => {
    return persistAccounts([...state.accounts, account]);
  };

  return (
    <DoctorAuthContext.Provider
      value={{
        doctor: state.doctor,
        accounts: state.accounts,
        ready: state.ready,
        saveError: state.saveError,
        signIn,
        signOut,
        updateAddress,
        updatePhoto,
        changePassword,
        requestPasswordReset,
        resetPassword,
        addAccount,
      }}
    >
      {children}
    </DoctorAuthContext.Provider>
  );
}

export function useDoctorAuth() {
  const ctx = useContext(DoctorAuthContext);
  if (!ctx) throw new Error("useDoctorAuth must be used within DoctorAuthProvider");
  return ctx;
}
