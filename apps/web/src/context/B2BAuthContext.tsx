"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { b2bAccountSeed, type B2BAccount } from "@/lib/b2b-auth-types";

const SESSION_KEY = "cph_b2b_session_id";

type Result = { ok: true } | { ok: false; error: string };

type B2BAuthValue = {
  supplier: B2BAccount | null;
  ready: boolean;
  signIn: (b2bId: string, password: string) => Result;
  signOut: () => void;
};

const B2BAuthContext = createContext<B2BAuthValue | null>(null);

function loadSession(): B2BAccount | null {
  const id = window.localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return b2bAccountSeed.find((a) => a.b2bId === id) ?? null;
}

export function B2BAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ supplier: B2BAccount | null; ready: boolean }>({ supplier: null, ready: false });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ supplier: loadSession(), ready: true });
  }, []);

  const signIn = (b2bId: string, password: string): Result => {
    const account = b2bAccountSeed.find((a) => a.b2bId.toLowerCase() === b2bId.trim().toLowerCase());
    if (!account || account.password !== password) {
      return { ok: false, error: "Incorrect B2B ID or password." };
    }
    window.localStorage.setItem(SESSION_KEY, account.b2bId);
    setState({ supplier: account, ready: true });
    return { ok: true };
  };

  const signOut = () => {
    window.localStorage.removeItem(SESSION_KEY);
    setState((s) => ({ ...s, supplier: null }));
  };

  return <B2BAuthContext.Provider value={{ supplier: state.supplier, ready: state.ready, signIn, signOut }}>{children}</B2BAuthContext.Provider>;
}

export function useB2BAuth() {
  const ctx = useContext(B2BAuthContext);
  if (!ctx) throw new Error("useB2BAuth must be used within B2BAuthProvider");
  return ctx;
}
