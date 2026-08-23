"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useB2B } from "@/context/B2BContext";
import { useCatalog } from "@/context/CatalogContext";
import { categorySeed } from "@/lib/category-seed";

const STORAGE_KEY = "cph_categories";

type CategoryValue = {
  categories: string[];
  ready: boolean;
  addCategory: (name: string) => void;
  renameCategory: (oldName: string, newName: string) => void;
  removeCategory: (name: string) => void;
};

const CategoryContext = createContext<CategoryValue | null>(null);

function loadStored(): string[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return categorySeed;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : categorySeed;
  } catch {
    return categorySeed;
  }
}

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const { renameCategoryInProducts } = useCatalog();
  const { renameCategoryInSubmissions } = useB2B();
  const [state, setState] = useState<{ categories: string[]; ready: boolean }>({ categories: categorySeed, ready: false });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ categories: loadStored(), ready: true });
  }, []);

  const persist = (categories: string[]) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    setState({ categories, ready: true });
  };

  const addCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || state.categories.includes(trimmed)) return;
    persist([...state.categories, trimmed]);
  };

  const renameCategory = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return;
    persist(state.categories.map((c) => (c === oldName ? trimmed : c)));
    renameCategoryInProducts(oldName, trimmed);
    renameCategoryInSubmissions(oldName, trimmed);
  };

  const removeCategory = (name: string) => {
    persist(state.categories.filter((c) => c !== name));
  };

  return (
    <CategoryContext.Provider value={{ categories: state.categories, ready: state.ready, addCategory, renameCategory, removeCategory }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategory() {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error("useCategory must be used within CategoryProvider");
  return ctx;
}
