"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { courierAccountSeed, type CourierAccount } from "@/lib/courier-auth-types";

const SESSION_KEY = "cph_courier_session_id";

type Result = { ok: true } | { ok: false; error: string };

type CourierAuthValue = {
  courier: CourierAccount | null;
  ready: boolean;
  signIn: (courierId: string, password: string) => Result;
  signOut: () => void;
};

const CourierAuthContext = createContext<CourierAuthValue | null>(null);

function loadSession(): CourierAccount | null {
  const id = window.localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return courierAccountSeed.find((a) => a.courierId === id) ?? null;
}

export function CourierAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ courier: CourierAccount | null; ready: boolean }>({ courier: null, ready: false });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ courier: loadSession(), ready: true });
  }, []);

  const signIn = (courierId: string, password: string): Result => {
    const account = courierAccountSeed.find((a) => a.courierId.toLowerCase() === courierId.trim().toLowerCase());
    if (!account || account.password !== password) {
      return { ok: false, error: "Incorrect Courier ID or password." };
    }
    window.localStorage.setItem(SESSION_KEY, account.courierId);
    setState({ courier: account, ready: true });
    return { ok: true };
  };

  const signOut = () => {
    window.localStorage.removeItem(SESSION_KEY);
    setState((s) => ({ ...s, courier: null }));
  };

  return (
    <CourierAuthContext.Provider value={{ courier: state.courier, ready: state.ready, signIn, signOut }}>{children}</CourierAuthContext.Provider>
  );
}

export function useCourierAuth() {
  const ctx = useContext(CourierAuthContext);
  if (!ctx) throw new Error("useCourierAuth must be used within CourierAuthProvider");
  return ctx;
}
