"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { howToBuySeed } from "@/lib/how-to-buy-seed";
import type { HowToBuyContent } from "@/lib/how-to-buy-types";

const STORAGE_KEY = "cph_how_to_buy";

type HowToBuyValue = {
  content: HowToBuyContent;
  ready: boolean;
  setIntro: (v: string) => void;
  setStepTitle: (index: number, v: string) => void;
  setStepDesc: (index: number, v: string) => void;
};

const HowToBuyContext = createContext<HowToBuyValue | null>(null);

function loadStored(): HowToBuyContent {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return howToBuySeed;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : howToBuySeed;
  } catch {
    return howToBuySeed;
  }
}

export function HowToBuyProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ content: HowToBuyContent; ready: boolean }>({ content: howToBuySeed, ready: false });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ content: loadStored(), ready: true });
  }, []);

  const persist = (content: HowToBuyContent) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    setState({ content, ready: true });
  };

  return (
    <HowToBuyContext.Provider
      value={{
        content: state.content,
        ready: state.ready,
        setIntro: (intro) => persist({ ...state.content, intro }),
        setStepTitle: (index, title) =>
          persist({ ...state.content, steps: state.content.steps.map((s, i) => (i === index ? { ...s, title } : s)) }),
        setStepDesc: (index, desc) =>
          persist({ ...state.content, steps: state.content.steps.map((s, i) => (i === index ? { ...s, desc } : s)) }),
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
