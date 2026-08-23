"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { brandSeed } from "@/lib/brand-seed";

// v2: the old key could carry a stale, pre-Brand-Setting brand list (e.g. missing brands
// added when the design's full 8-brand set was wired up) — bump so those reload the seed.
const STORAGE_KEY = "cph_brands_v2";

type BrandValue = {
  brands: string[];
  ready: boolean;
  addBrand: (name: string) => void;
  removeBrand: (name: string) => void;
};

const BrandContext = createContext<BrandValue | null>(null);

function loadStored(): string[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return brandSeed;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : brandSeed;
  } catch {
    return brandSeed;
  }
}

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ brands: string[]; ready: boolean }>({ brands: brandSeed, ready: false });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ brands: loadStored(), ready: true });
  }, []);

  const persist = (brands: string[]) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(brands));
    setState({ brands, ready: true });
  };

  const addBrand = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || state.brands.includes(trimmed)) return;
    persist([...state.brands, trimmed]);
  };

  const removeBrand = (name: string) => {
    persist(state.brands.filter((b) => b !== name));
  };

  return (
    <BrandContext.Provider value={{ brands: state.brands, ready: state.ready, addBrand, removeBrand }}>{children}</BrandContext.Provider>
  );
}

export function useBrand() {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error("useBrand must be used within BrandProvider");
  return ctx;
}
