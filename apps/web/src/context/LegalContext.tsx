"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { privacySeed, refundSeed, termsSeed } from "@/lib/legal-seed";
import type { LegalDoc } from "@/lib/legal-types";

const STORAGE_KEY = "cph_legal_docs";

type LegalState = { terms: LegalDoc; privacy: LegalDoc; refund: LegalDoc };

type LegalValue = {
  terms: LegalDoc;
  privacy: LegalDoc;
  refund: LegalDoc;
  ready: boolean;
  updateTerms: (patch: Partial<LegalDoc>) => void;
  updatePrivacy: (patch: Partial<LegalDoc>) => void;
  updateRefund: (patch: Partial<LegalDoc>) => void;
};

const LegalContext = createContext<LegalValue | null>(null);

const DEFAULTS: LegalState = { terms: termsSeed, privacy: privacySeed, refund: refundSeed };

function loadStored(): LegalState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return {
      terms: parsed?.terms ?? termsSeed,
      privacy: parsed?.privacy ?? privacySeed,
      refund: parsed?.refund ?? refundSeed,
    };
  } catch {
    return DEFAULTS;
  }
}

export function LegalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LegalState & { ready: boolean }>({ ...DEFAULTS, ready: false });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ ...loadStored(), ready: true });
  }, []);

  const persist = (next: LegalState) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setState({ ...next, ready: true });
  };

  return (
    <LegalContext.Provider
      value={{
        terms: state.terms,
        privacy: state.privacy,
        refund: state.refund,
        ready: state.ready,
        updateTerms: (patch) => persist({ terms: { ...state.terms, ...patch }, privacy: state.privacy, refund: state.refund }),
        updatePrivacy: (patch) => persist({ terms: state.terms, privacy: { ...state.privacy, ...patch }, refund: state.refund }),
        updateRefund: (patch) => persist({ terms: state.terms, privacy: state.privacy, refund: { ...state.refund, ...patch } }),
      }}
    >
      {children}
    </LegalContext.Provider>
  );
}

export function useLegal() {
  const ctx = useContext(LegalContext);
  if (!ctx) throw new Error("useLegal must be used within LegalProvider");
  return ctx;
}
