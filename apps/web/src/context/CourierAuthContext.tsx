"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { courierAccountSeed, type CourierAccount } from "@/lib/courier-auth-types";

const SESSION_KEY = "cph_courier_session_id";
const OVERRIDES_KEY = "cph_courier_account_overrides";

type Result = { ok: true } | { ok: false; error: string };
type Overrides = Record<string, Partial<Pick<CourierAccount, "password" | "phone" | "altPhone" | "address">>>;

type CourierAuthValue = {
  courier: CourierAccount | null;
  ready: boolean;
  signIn: (courierId: string, password: string) => Result;
  signOut: () => void;
  updateProfile: (patch: { phone: string; altPhone: string; address: string }) => void;
  changePassword: (newPassword: string) => void;
};

const CourierAuthContext = createContext<CourierAuthValue | null>(null);

function loadOverrides(): Overrides {
  try {
    const raw = window.localStorage.getItem(OVERRIDES_KEY);
    return raw ? (JSON.parse(raw) as Overrides) : {};
  } catch {
    return {};
  }
}

function applyOverrides(accounts: CourierAccount[], overrides: Overrides): CourierAccount[] {
  return accounts.map((a) => ({ ...a, ...overrides[a.courierId] }));
}

function loadSession(accounts: CourierAccount[]): CourierAccount | null {
  const id = window.localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return accounts.find((a) => a.courierId === id) ?? null;
}

export function CourierAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ accounts: CourierAccount[]; courier: CourierAccount | null; ready: boolean }>({
    accounts: courierAccountSeed,
    courier: null,
    ready: false,
  });

  useEffect(() => {
    const accounts = applyOverrides(courierAccountSeed, loadOverrides());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ accounts, courier: loadSession(accounts), ready: true });
  }, []);

  const persistOverride = (courierId: string, patch: Partial<Pick<CourierAccount, "password" | "phone" | "altPhone" | "address">>) => {
    const overrides = loadOverrides();
    overrides[courierId] = { ...overrides[courierId], ...patch };
    window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
  };

  const signIn = (courierId: string, password: string): Result => {
    const account = state.accounts.find((a) => a.courierId.toLowerCase() === courierId.trim().toLowerCase());
    if (!account || account.password !== password) {
      return { ok: false, error: "Incorrect Courier ID or password." };
    }
    window.localStorage.setItem(SESSION_KEY, account.courierId);
    setState((s) => ({ ...s, courier: account }));
    return { ok: true };
  };

  const signOut = () => {
    window.localStorage.removeItem(SESSION_KEY);
    setState((s) => ({ ...s, courier: null }));
  };

  const updateProfile = (patch: { phone: string; altPhone: string; address: string }) => {
    setState((s) => {
      if (!s.courier) return s;
      persistOverride(s.courier.courierId, patch);
      const updated = { ...s.courier, ...patch };
      const accounts = s.accounts.map((a) => (a.courierId === updated.courierId ? updated : a));
      return { accounts, courier: updated, ready: true };
    });
  };

  const changePassword = (newPassword: string) => {
    setState((s) => {
      if (!s.courier) return s;
      persistOverride(s.courier.courierId, { password: newPassword });
      const updated = { ...s.courier, password: newPassword };
      const accounts = s.accounts.map((a) => (a.courierId === updated.courierId ? updated : a));
      return { accounts, courier: updated, ready: true };
    });
  };

  return (
    <CourierAuthContext.Provider
      value={{ courier: state.courier, ready: state.ready, signIn, signOut, updateProfile, changePassword }}
    >
      {children}
    </CourierAuthContext.Provider>
  );
}

export function useCourierAuth() {
  const ctx = useContext(CourierAuthContext);
  if (!ctx) throw new Error("useCourierAuth must be used within CourierAuthProvider");
  return ctx;
}
