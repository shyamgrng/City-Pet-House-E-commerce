"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { CartItem } from "@/lib/cart-types";

const STORAGE_KEY = "cph_cart";

type CartableItem = { id: string; name: string; price: number };

type CartValue = {
  items: CartItem[];
  ready: boolean;
  count: number;
  subtotal: number;
  addItem: (item: CartableItem, qty?: number) => void;
  inc: (productId: string) => void;
  dec: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartValue | null>(null);

function loadStored(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ items: CartItem[]; ready: boolean }>({ items: [], ready: false });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ items: loadStored(), ready: true });
  }, []);

  const persist = (items: CartItem[]) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    setState({ items, ready: true });
  };

  const addItem = (item: CartableItem, qty = 1) => {
    const existing = state.items.find((i) => i.productId === item.id);
    if (existing) {
      persist(state.items.map((i) => (i.productId === item.id ? { ...i, qty: i.qty + qty } : i)));
    } else {
      persist([...state.items, { productId: item.id, name: item.name, price: item.price, qty }]);
    }
  };

  const inc = (productId: string) => {
    persist(state.items.map((i) => (i.productId === productId ? { ...i, qty: i.qty + 1 } : i)));
  };

  const dec = (productId: string) => {
    persist(
      state.items
        .map((i) => (i.productId === productId ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const remove = (productId: string) => {
    persist(state.items.filter((i) => i.productId !== productId));
  };

  const clear = () => persist([]);

  const count = state.items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items: state.items, ready: state.ready, count, subtotal, addItem, inc, dec, remove, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
