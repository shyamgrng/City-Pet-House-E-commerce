"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { notifyEvent } from "@/lib/notify-client";
import type { B2BRegistration, RegistrationStatus } from "@/lib/b2b-registration-types";

const STORAGE_KEY = "cph_b2b_registrations";
const STORAGE_FULL_MESSAGE =
  "Couldn't save — your browser's storage is full. Delete an old photo or video somewhere on the site to free up space, then try again.";

type NewRegistrationInput = Omit<B2BRegistration, "id" | "status" | "submittedAt">;

type B2BRegistrationValue = {
  registrations: B2BRegistration[];
  ready: boolean;
  saveError: string | null;
  submitRegistration: (input: NewRegistrationInput) => boolean;
  setRegistrationStatus: (id: string, status: RegistrationStatus) => boolean;
};

const B2BRegistrationContext = createContext<B2BRegistrationValue | null>(null);

function loadRegistrations(): B2BRegistration[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as B2BRegistration[]) : [];
  } catch {
    return [];
  }
}

export function B2BRegistrationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ registrations: B2BRegistration[]; ready: boolean; saveError: string | null }>({
    registrations: [],
    ready: false,
    saveError: null,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ registrations: loadRegistrations(), ready: true, saveError: null });
  }, []);

  const persist = (registrations: B2BRegistration[]): boolean => {
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
    const registration: B2BRegistration = {
      ...input,
      id: "B2G-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      status: "Pending",
      submittedAt: Date.now(),
    };
    const ok = persist([registration, ...state.registrations]);
    if (ok) {
      notifyEvent("partner_registration_received", input.email, input.contactPerson || input.companyName, {
        name: input.contactPerson || input.companyName,
        role: "B2B supplier",
      });
    }
    return ok;
  };

  const setRegistrationStatus = (id: string, status: RegistrationStatus): boolean => {
    return persist(state.registrations.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  return (
    <B2BRegistrationContext.Provider
      value={{ registrations: state.registrations, ready: state.ready, saveError: state.saveError, submitRegistration, setRegistrationStatus }}
    >
      {children}
    </B2BRegistrationContext.Provider>
  );
}

export function useB2BRegistration() {
  const ctx = useContext(B2BRegistrationContext);
  if (!ctx) throw new Error("useB2BRegistration must be used within B2BRegistrationProvider");
  return ctx;
}
