"use client";

import { createContext, useContext } from "react";
import { privacySeed, refundSeed, termsSeed } from "@/lib/legal-seed";
import type { LegalDoc } from "@/lib/legal-types";
import { useSiteContentStore } from "@/lib/site-content-store";

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

export function LegalProvider({ children }: { children: React.ReactNode }) {
  const { data: state, ready, update: persist } = useSiteContentStore<LegalState>(STORAGE_KEY, DEFAULTS);

  return (
    <LegalContext.Provider
      value={{
        terms: state.terms,
        privacy: state.privacy,
        refund: state.refund,
        ready,
        updateTerms: (patch) => persist({ ...state, terms: { ...state.terms, ...patch } }),
        updatePrivacy: (patch) => persist({ ...state, privacy: { ...state.privacy, ...patch } }),
        updateRefund: (patch) => persist({ ...state, refund: { ...state.refund, ...patch } }),
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
