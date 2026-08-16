"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { getDeviceKey } from "@/lib/device-key";
import { useAuth } from "./AuthContext";

export interface CartLine {
  productId: string;
  name: string;
  unitPrice: number;
  qty: number;
  image: string | null;
  outOfStock: boolean;
}

interface CartSnapshot {
  id: string;
  items: CartLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

interface CartContextValue extends CartSnapshot {
  loading: boolean;
  addItem: (productId: string, qty?: number) => Promise<void>;
  updateItem: (productId: string, qty: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const EMPTY: CartSnapshot = { id: "", items: [], subtotal: 0, deliveryFee: 0, total: 0 };

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { accessToken } = useAuth();
  const [cart, setCart] = useState<CartSnapshot>(EMPTY);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const deviceKey = getDeviceKey();
      const query = accessToken ? "" : `?deviceKey=${encodeURIComponent(deviceKey)}`;
      const snapshot = await apiFetch<CartSnapshot>(`/cart${query}`, { accessToken });
      setCart(snapshot);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (productId: string, qty = 1) => {
      const snapshot = await apiFetch<CartSnapshot>("/cart/items", {
        method: "POST",
        accessToken,
        body: { productId, qty, deviceKey: getDeviceKey() },
      });
      setCart(snapshot);
    },
    [accessToken],
  );

  const updateItem = useCallback(
    async (productId: string, qty: number) => {
      const snapshot = await apiFetch<CartSnapshot>(`/cart/items/${productId}`, {
        method: "PATCH",
        accessToken,
        body: { qty, deviceKey: getDeviceKey() },
      });
      setCart(snapshot);
    },
    [accessToken],
  );

  const removeItem = useCallback(
    async (productId: string) => {
      const deviceKey = getDeviceKey();
      const query = accessToken ? "" : `?deviceKey=${encodeURIComponent(deviceKey)}`;
      const snapshot = await apiFetch<CartSnapshot>(`/cart/items/${productId}${query}`, {
        method: "DELETE",
        accessToken,
      });
      setCart(snapshot);
    },
    [accessToken],
  );

  return (
    <CartContext.Provider value={{ ...cart, loading, addItem, updateItem, removeItem, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
