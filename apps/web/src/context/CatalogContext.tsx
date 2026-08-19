"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { catalogSeed } from "@/lib/catalog-seed";
import type { Product } from "@/lib/catalog-types";
import { slugify } from "@/lib/catalog-types";

const STORAGE_KEY = "cph_catalog";

type CatalogValue = {
  products: Product[];
  ready: boolean;
  addProduct: (input: Omit<Product, "id">) => void;
  updateProduct: (id: string, input: Omit<Product, "id">) => void;
  deleteProduct: (id: string) => void;
};

const CatalogContext = createContext<CatalogValue | null>(null);

function loadStored(): Product[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return catalogSeed;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : catalogSeed;
  } catch {
    return catalogSeed;
  }
}

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ products: Product[]; ready: boolean }>({ products: catalogSeed, ready: false });

  useEffect(() => {
    // One-time hydration from localStorage on mount — no external event to subscribe to.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ products: loadStored(), ready: true });
  }, []);

  const persist = (products: Product[]) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    setState({ products, ready: true });
  };

  const addProduct = (input: Omit<Product, "id">) => {
    const id = slugify(input.name) + "-" + Math.random().toString(36).slice(2, 7);
    persist([{ ...input, id }, ...state.products]);
  };

  const updateProduct = (id: string, input: Omit<Product, "id">) => {
    persist(state.products.map((p) => (p.id === id ? { ...input, id } : p)));
  };

  const deleteProduct = (id: string) => {
    persist(state.products.filter((p) => p.id !== id));
  };

  return (
    <CatalogContext.Provider value={{ products: state.products, ready: state.ready, addProduct, updateProduct, deleteProduct }}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}
