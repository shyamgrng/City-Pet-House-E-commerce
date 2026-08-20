"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { doctorAccountSeed, type DoctorAccount } from "@/lib/doctor-auth-types";

const SESSION_KEY = "cph_doctor_session_id";
const OVERRIDES_KEY = "cph_doctor_account_overrides";

type Result = { ok: true } | { ok: false; error: string };
type Overrides = Record<string, Partial<Pick<DoctorAccount, "password" | "address">>>;

type DoctorAuthValue = {
  doctor: DoctorAccount | null;
  ready: boolean;
  signIn: (doctorId: string, password: string) => Result;
  signOut: () => void;
  updateAddress: (address: string) => void;
  changePassword: (newPassword: string) => void;
};

const DoctorAuthContext = createContext<DoctorAuthValue | null>(null);

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

  const persistOverride = (doctorId: string, patch: Partial<Pick<DoctorAccount, "password" | "address">>) => {
    const overrides = loadOverrides();
    overrides[doctorId] = { ...overrides[doctorId], ...patch };
    window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
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

  return (
    <DoctorAuthContext.Provider value={{ doctor: state.doctor, ready: state.ready, signIn, signOut, updateAddress, changePassword }}>
      {children}
    </DoctorAuthContext.Provider>
  );
}

export function useDoctorAuth() {
  const ctx = useContext(DoctorAuthContext);
  if (!ctx) throw new Error("useDoctorAuth must be used within DoctorAuthProvider");
  return ctx;
}
