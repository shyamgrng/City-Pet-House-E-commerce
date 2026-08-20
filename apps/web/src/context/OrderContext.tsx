"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { orderSeed } from "@/lib/order-seed";
import type { Order, OrderItem } from "@/lib/order-types";

const STORAGE_KEY = "cph_orders";

type PlaceOrderInput = {
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
};

type OrderValue = {
  orders: Order[];
  ready: boolean;
  placeOrder: (input: PlaceOrderInput) => string;
  approveOrder: (id: string) => void;
  rejectOrder: (id: string, reason: string) => void;
  markOnTheWay: (id: string) => void;
  markDelivered: (id: string) => void;
  submitReview: (id: string, productId: string, rating: number, comment: string) => void;
};

const OrderContext = createContext<OrderValue | null>(null);

function loadStored(): Order[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return orderSeed;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : orderSeed;
  } catch {
    return orderSeed;
  }
}

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ orders: Order[]; ready: boolean }>({ orders: orderSeed, ready: false });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ orders: loadStored(), ready: true });
  }, []);

  const persist = (orders: Order[]) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    setState({ orders, ready: true });
  };

  const update = (id: string, patch: Partial<Order>) => {
    persist(state.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  };

  const placeOrder = (input: PlaceOrderInput): string => {
    const id = "ORD-" + Math.floor(2000 + Math.random() * 8000);
    const order: Order = { ...input, id, status: "Receipt Uploaded", createdAt: Date.now() };
    persist([order, ...state.orders]);
    return id;
  };

  return (
    <OrderContext.Provider
      value={{
        orders: state.orders,
        ready: state.ready,
        placeOrder,
        approveOrder: (id) => update(id, { status: "Payment Approved", approvedAt: Date.now() }),
        rejectOrder: (id, reason) => update(id, { status: "Payment Rejected", rejectReason: reason }),
        markOnTheWay: (id) => update(id, { status: "On the Way" }),
        markDelivered: (id) => update(id, { status: "Delivered", deliveredAt: Date.now() }),
        submitReview: (id, productId, rating, comment) => {
          const order = state.orders.find((o) => o.id === id);
          if (!order) return;
          update(id, { reviews: { ...order.reviews, [productId]: { rating, comment } } });
        },
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used within OrderProvider");
  return ctx;
}
