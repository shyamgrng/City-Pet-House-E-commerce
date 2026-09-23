"use client";

import { createContext, useContext } from "react";
import { howToBuySeed } from "@/lib/how-to-buy-seed";
import type { HowToBuyContent } from "@/lib/how-to-buy-types";
import { useSiteContentStore } from "@/lib/site-content-store";

const STORAGE_KEY = "cph_how_to_buy";

type HowToBuyValue = {
  content: HowToBuyContent;
  ready: boolean;
  setIntro: (v: string) => void;
  setStepTitle: (index: number, v: string) => void;
  setStepDesc: (index: number, v: string) => void;
};

const HowToBuyContext = createContext<HowToBuyValue | null>(null);

export function HowToBuyProvider({ children }: { children: React.ReactNode }) {
  const { data: content, ready, update: persist } = useSiteContentStore<HowToBuyContent>(STORAGE_KEY, howToBuySeed);

  return (
    <HowToBuyContext.Provider
      value={{
        content,
        ready,
        setIntro: (intro) => persist({ ...content, intro }),
        setStepTitle: (index, title) => persist({ ...content, steps: content.steps.map((s, i) => (i === index ? { ...s, title } : s)) }),
        setStepDesc: (index, desc) => persist({ ...content, steps: content.steps.map((s, i) => (i === index ? { ...s, desc } : s)) }),
      }}
    >
      {children}
    </HowToBuyContext.Provider>
  );
}

export function useHowToBuy() {
  const ctx = useContext(HowToBuyContext);
  if (!ctx) throw new Error("useHowToBuy must be used within HowToBuyProvider");
  return ctx;
}
