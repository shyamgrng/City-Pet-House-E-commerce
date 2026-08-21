"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { notifyEvent } from "@/lib/notify-client";
import { doctorAccountSeed, type DoctorAccount } from "@/lib/doctor-auth-types";

const SESSION_KEY = "cph_doctor_session_id";
const OVERRIDES_KEY = "cph_doctor_account_overrides";
const RESETS_KEY = "cph_doctor_password_resets";
const RESET_CODE_TTL_MS = 15 * 60 * 1000;

type Result = { ok: true } | { ok: false; error: string };
type Overrides = Record<string, Partial<Pick<DoctorAccount, "password" | "address" | "photo">>>;
type ResetRecord = { code: string; expiresAt: number };

type DoctorAuthValue = {
  doctor: DoctorAccount | null;
  ready: boolean;
  signIn: (doctorId: string, password: string) => Result;
  signOut: () => void;
  updateAddress: (address: string) => void;
  updatePhoto: (photo: string) => void;
  changePassword: (newPassword: string) => void;
  requestPasswordReset: (doctorId: string) => Result;
  resetPassword: (doctorId: string, code: string, newPassword: string) => Result;
};

const DoctorAuthContext = createContext<DoctorAuthValue | null>(null);

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

function applyOverrides(accounts: DoctorAccount[], overrides: Overrides): DoctorAccount[] {
  return accounts.map((a) => ({ ...a, ...overrides[a.doctorId] }));
}

function loadSession(accounts: DoctorAccount[]): DoctorAccount | null {
  const id = window.localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return accounts.find((d) => d.doctorId === id) ?? null;
}

export function DoctorAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ accounts: DoctorAccount[]; doctor: DoctorAccount | null; ready: boolean }>({
    accounts: doctorAccountSeed,
    doctor: null,
    ready: false,
  });

  useEffect(() => {
    const accounts = applyOverrides(doctorAccountSeed, loadOverrides());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ accounts, doctor: loadSession(accounts), ready: true });
  }, []);

  const persistOverride = (doctorId: string, patch: Partial<Pick<DoctorAccount, "password" | "address" | "photo">>) => {
    const overrides = loadOverrides();
    overrides[doctorId] = { ...overrides[doctorId], ...patch };
    window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
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
    persistOverride(account.doctorId, { password: newPassword });
    const updated = { ...account, password: newPassword };
    const accounts = state.accounts.map((a) => (a.doctorId === updated.doctorId ? updated : a));
    setState((s) => ({ ...s, accounts }));
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
    setState((s) => {
      if (!s.doctor) return s;
      persistOverride(s.doctor.doctorId, { address });
      const updated = { ...s.doctor, address };
      const accounts = s.accounts.map((a) => (a.doctorId === updated.doctorId ? updated : a));
      return { accounts, doctor: updated, ready: true };
    });
  };

  const changePassword = (newPassword: string) => {
    setState((s) => {
      if (!s.doctor) return s;
      persistOverride(s.doctor.doctorId, { password: newPassword });
      const updated = { ...s.doctor, password: newPassword };
      const accounts = s.accounts.map((a) => (a.doctorId === updated.doctorId ? updated : a));
      return { accounts, doctor: updated, ready: true };
    });
  };

  const updatePhoto = (photo: string) => {
    setState((s) => {
      if (!s.doctor) return s;
      persistOverride(s.doctor.doctorId, { photo });
      const updated = { ...s.doctor, photo };
      const accounts = s.accounts.map((a) => (a.doctorId === updated.doctorId ? updated : a));
      return { accounts, doctor: updated, ready: true };
    });
  };

  return (
    <DoctorAuthContext.Provider
      value={{ doctor: state.doctor, ready: state.ready, signIn, signOut, updateAddress, updatePhoto, changePassword, requestPasswordReset, resetPassword }}
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
