"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { notifyEvent } from "@/lib/notify-client";
import type { RegistrationStatus, StaffRegistration } from "@/lib/staff-registration-types";

const STORAGE_KEY = "cph_staff_registrations";
const STORAGE_FULL_MESSAGE =
  "Couldn't save — your browser's storage is full. Delete an old photo or video somewhere on the site to free up space, then try again.";

type NewRegistrationInput = Omit<StaffRegistration, "id" | "status" | "submittedAt">;

type StaffRegistrationValue = {
  registrations: StaffRegistration[];
  ready: boolean;
  saveError: string | null;
  submitRegistration: (input: NewRegistrationInput) => boolean;
  setRegistrationStatus: (id: string, status: RegistrationStatus) => boolean;
};

const StaffRegistrationContext = createContext<StaffRegistrationValue | null>(null);

function loadRegistrations(): StaffRegistration[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StaffRegistration[]) : [];
  } catch {
    return [];
  }
}

export function StaffRegistrationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ registrations: StaffRegistration[]; ready: boolean; saveError: string | null }>({
    registrations: [],
    ready: false,
    saveError: null,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ registrations: loadRegistrations(), ready: true, saveError: null });
  }, []);

  const persist = (registrations: StaffRegistration[]): boolean => {
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
    const registration: StaffRegistration = {
      ...input,
      id: "SRG-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      status: "Pending",
      submittedAt: Date.now(),
    };
    const ok = persist([registration, ...state.registrations]);
    if (ok) {
      notifyEvent("partner_registration_received", input.email, input.fullName, { name: input.fullName, role: "Staff" });
    }
    return ok;
  };

  const setRegistrationStatus = (id: string, status: RegistrationStatus): boolean => {
    return persist(state.registrations.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  return (
    <StaffRegistrationContext.Provider
      value={{ registrations: state.registrations, ready: state.ready, saveError: state.saveError, submitRegistration, setRegistrationStatus }}
    >
      {children}
    </StaffRegistrationContext.Provider>
  );
}

export function useStaffRegistration() {
  const ctx = useContext(StaffRegistrationContext);
  if (!ctx) throw new Error("useStaffRegistration must be used within StaffRegistrationProvider");
  return ctx;
}
