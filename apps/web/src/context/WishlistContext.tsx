"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { WishlistItem } from "@/lib/wishlist-types";

const STORAGE_KEY = "cph_wishlist";

type WishlistValue = {
  items: WishlistItem[];
  ready: boolean;
  has: (id: string, kind: WishlistItem["kind"]) => boolean;
  toggle: (item: WishlistItem) => void;
};

const WishlistContext = createContext<WishlistValue | null>(null);

function loadStored(): WishlistItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WishlistItem[]) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ items: WishlistItem[]; ready: boolean }>({ items: [], ready: false });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ items: loadStored(), ready: true });
  }, []);

  const persist = (items: WishlistItem[]) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    setState({ items, ready: true });
  };

  const has = (id: string, kind: WishlistItem["kind"]) => state.items.some((i) => i.id === id && i.kind === kind);

  const toggle = (item: WishlistItem) => {
    if (has(item.id, item.kind)) {
      persist(state.items.filter((i) => !(i.id === item.id && i.kind === item.kind)));
    } else {
      persist([item, ...state.items]);
    }
  };

  return <WishlistContext.Provider value={{ items: state.items, ready: state.ready, has, toggle }}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
