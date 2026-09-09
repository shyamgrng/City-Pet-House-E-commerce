"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { restockOrderSeed } from "@/lib/restock-seed";
import type { RestockInitiator, RestockOrder } from "@/lib/restock-types";

const STORAGE_KEY = "cph_restock_orders";

type NewRestockInput = {
  b2bId: string;
  companyName: string;
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
  note: string;
  initiatedBy: RestockInitiator;
};

type RestockValue = {
  orders: RestockOrder[];
  ready: boolean;
  createOrder: (input: NewRestockInput) => void;
  respondToOrder: (id: string, accept: boolean) => void;
  markDispatched: (id: string) => void;
  markDelivered: (id: string) => void;
};

const RestockContext = createContext<RestockValue | null>(null);

function normalizeOrder(o: Partial<RestockOrder> & { id: string }): RestockOrder {
  return {
    b2bId: "",
    companyName: "",
    productId: "",
    productName: "",
    qty: 0,
    unitPrice: 0,
    note: "",
    initiatedBy: "Admin",
    status: "Pending",
    createdAt: Date.now(),
    ...o,
  };
}

function loadStored(): RestockOrder[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return restockOrderSeed;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed.map(normalizeOrder) : restockOrderSeed;
  } catch {
    return restockOrderSeed;
  }
}

export function RestockProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ orders: RestockOrder[]; ready: boolean }>({ orders: restockOrderSeed, ready: false });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ orders: loadStored(), ready: true });
  }, []);

  const persist = (orders: RestockOrder[]) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    setState({ orders, ready: true });
  };

  const createOrder = (input: NewRestockInput) => {
    const id = "RS-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    persist([{ ...input, id, status: "Pending", createdAt: Date.now() }, ...state.orders]);
  };

  const respondToOrder = (id: string, accept: boolean) => {
    persist(
      state.orders.map((o) => (o.id === id ? { ...o, status: accept ? "Accepted" : "Declined", respondedAt: Date.now() } : o)),
    );
  };

  const markDispatched = (id: string) => {
    persist(state.orders.map((o) => (o.id === id ? { ...o, status: "Dispatched", dispatchedAt: Date.now() } : o)));
  };

  const markDelivered = (id: string) => {
    persist(state.orders.map((o) => (o.id === id ? { ...o, status: "Delivered", deliveredAt: Date.now() } : o)));
  };

  return (
    <RestockContext.Provider value={{ orders: state.orders, ready: state.ready, createOrder, respondToOrder, markDispatched, markDelivered }}>
      {children}
    </RestockContext.Provider>
  );
}

export function useRestock() {
  const ctx = useContext(RestockContext);
  if (!ctx) throw new Error("useRestock must be used within RestockProvider");
  return ctx;
}
