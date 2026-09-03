"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { notifyEvent } from "@/lib/notify-client";
import type { CourierRegistration, RegistrationStatus } from "@/lib/courier-registration-types";

const STORAGE_KEY = "cph_courier_registrations";
const STORAGE_FULL_MESSAGE =
  "Couldn't save — your browser's storage is full. Delete an old photo or video somewhere on the site to free up space, then try again.";

type NewRegistrationInput = Omit<CourierRegistration, "id" | "status" | "submittedAt">;

type CourierRegistrationValue = {
  registrations: CourierRegistration[];
  ready: boolean;
  saveError: string | null;
  submitRegistration: (input: NewRegistrationInput) => boolean;
  setRegistrationStatus: (id: string, status: RegistrationStatus) => boolean;
};

const CourierRegistrationContext = createContext<CourierRegistrationValue | null>(null);

function loadRegistrations(): CourierRegistration[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CourierRegistration[]) : [];
  } catch {
    return [];
  }
}

export function CourierRegistrationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ registrations: CourierRegistration[]; ready: boolean; saveError: string | null }>({
    registrations: [],
    ready: false,
    saveError: null,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ registrations: loadRegistrations(), ready: true, saveError: null });
  }, []);

  const persist = (registrations: CourierRegistration[]): boolean => {
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
    const registration: CourierRegistration = {
      ...input,
      id: "CRG-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      status: "Pending",
      submittedAt: Date.now(),
    };
    const ok = persist([registration, ...state.registrations]);
    if (ok) {
      notifyEvent("partner_registration_received", input.email, input.contactPerson || input.companyName, {
        name: input.contactPerson || input.companyName,
        role: "courier",
      });
    }
    return ok;
  };

  const setRegistrationStatus = (id: string, status: RegistrationStatus): boolean => {
    return persist(state.registrations.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  return (
    <CourierRegistrationContext.Provider
      value={{ registrations: state.registrations, ready: state.ready, saveError: state.saveError, submitRegistration, setRegistrationStatus }}
    >
      {children}
    </CourierRegistrationContext.Provider>
  );
}

export function useCourierRegistration() {
  const ctx = useContext(CourierRegistrationContext);
  if (!ctx) throw new Error("useCourierRegistration must be used within CourierRegistrationProvider");
  return ctx;
}
