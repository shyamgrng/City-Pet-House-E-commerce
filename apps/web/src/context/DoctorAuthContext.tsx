"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { doctorAccountSeed, type DoctorAccount } from "@/lib/doctor-auth-types";

const SESSION_KEY = "cph_doctor_session_id";

type Result = { ok: true } | { ok: false; error: string };

type DoctorAuthValue = {
  doctor: DoctorAccount | null;
  ready: boolean;
  signIn: (doctorId: string, password: string) => Result;
  signOut: () => void;
};

const DoctorAuthContext = createContext<DoctorAuthValue | null>(null);

function loadSession(): DoctorAccount | null {
  const id = window.localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return doctorAccountSeed.find((d) => d.doctorId === id) ?? null;
}

export function DoctorAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ doctor: DoctorAccount | null; ready: boolean }>({ doctor: null, ready: false });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ doctor: loadSession(), ready: true });
  }, []);

  const signIn = (doctorId: string, password: string): Result => {
    const account = doctorAccountSeed.find((d) => d.doctorId.toLowerCase() === doctorId.trim().toLowerCase());
    if (!account || account.password !== password) {
      return { ok: false, error: "Incorrect Doctor ID or password." };
    }
    window.localStorage.setItem(SESSION_KEY, account.doctorId);
    setState({ doctor: account, ready: true });
    return { ok: true };
  };

  const signOut = () => {
    window.localStorage.removeItem(SESSION_KEY);
    setState((s) => ({ ...s, doctor: null }));
  };

  return <DoctorAuthContext.Provider value={{ doctor: state.doctor, ready: state.ready, signIn, signOut }}>{children}</DoctorAuthContext.Provider>;
}

export function useDoctorAuth() {
  const ctx = useContext(DoctorAuthContext);
  if (!ctx) throw new Error("useDoctorAuth must be used within DoctorAuthProvider");
  return ctx;
}
