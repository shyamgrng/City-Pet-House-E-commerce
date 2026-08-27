"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { notifyEvent } from "@/lib/notify-client";
import type { DoctorRegistration, RegistrationStatus } from "@/lib/doctor-registration-types";

const STORAGE_KEY = "cph_doctor_registrations";
const STORAGE_FULL_MESSAGE =
  "Couldn't save — your browser's storage is full. Delete an old photo or video somewhere on the site to free up space, then try again.";

type NewRegistrationInput = Omit<DoctorRegistration, "id" | "status" | "submittedAt">;

type DoctorRegistrationValue = {
  registrations: DoctorRegistration[];
  ready: boolean;
  saveError: string | null;
  submitRegistration: (input: NewRegistrationInput) => boolean;
  setRegistrationStatus: (id: string, status: RegistrationStatus) => boolean;
};

const DoctorRegistrationContext = createContext<DoctorRegistrationValue | null>(null);

function loadRegistrations(): DoctorRegistration[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DoctorRegistration[]) : [];
  } catch {
    return [];
  }
}

export function DoctorRegistrationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ registrations: DoctorRegistration[]; ready: boolean; saveError: string | null }>({
    registrations: [],
    ready: false,
    saveError: null,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ registrations: loadRegistrations(), ready: true, saveError: null });
  }, []);

  // Self-contained: does its own try/catch and its own single setState call, rather than being
  // nested inside a caller's setState updater -- a quota-exceeded error thrown from inside a
  // setState updater is a React render-phase error and crashes to the error page.
  const persist = (registrations: DoctorRegistration[]): boolean => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
    } catch {
      setState((s) => ({ ...s, saveError: STORAGE_FULL_MESSAGE }));
      return false;
    }
    setState((s) => ({ ...s, registrations, saveError: null }));
    return true;
  };

  const submitRegistration = (input: NewRegistrationInput): boolean => {
    const registration: DoctorRegistration = {
      ...input,
      id: "DRG-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      status: "Pending",
      submittedAt: Date.now(),
    };
    const ok = persist([registration, ...state.registrations]);
    if (ok) {
      notifyEvent("doctor_registration_received", input.email, input.fullName, { name: input.fullName });
    }
    return ok;
  };

  const setRegistrationStatus = (id: string, status: RegistrationStatus): boolean => {
    return persist(state.registrations.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  return (
    <DoctorRegistrationContext.Provider
      value={{ registrations: state.registrations, ready: state.ready, saveError: state.saveError, submitRegistration, setRegistrationStatus }}
    >
      {children}
    </DoctorRegistrationContext.Provider>
  );
}

export function useDoctorRegistration() {
  const ctx = useContext(DoctorRegistrationContext);
  if (!ctx) throw new Error("useDoctorRegistration must be used within DoctorRegistrationProvider");
  return ctx;
}
