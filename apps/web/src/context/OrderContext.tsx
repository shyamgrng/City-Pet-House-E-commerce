"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { EmailEvent } from "@/lib/email-templates";
import { notifyEvent } from "@/lib/notify-client";
import { orderSeed } from "@/lib/order-seed";
import { defaultChecklist, defaultSupplierChecklist, type Order, type OrderItem } from "@/lib/order-types";
import { refundSeed } from "@/lib/refund-seed";
import type { RefundRecord } from "@/lib/refund-types";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "cph_orders";
const REFUNDS_KEY = "cph_refunds";

const STORAGE_FULL_MESSAGE = "Couldn't save — your browser's storage is full. Delete an old photo or video somewhere on the site to free up space, then try again.";
const CLOUD_ERROR_MESSAGE = "Couldn't save — check your internet connection and try again.";

type OrderRow = { id: string; data: Order };
type RefundRow = { id: string; data: RefundRecord };

type PlaceOrderInput = {
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  receiptPhoto: string;
};

type OrderValue = {
  orders: Order[];
  refunds: RefundRecord[];
  ready: boolean;
  saveError: string | null;
  placeOrder: (input: PlaceOrderInput) => string;
  approveOrder: (id: string) => void;
  rejectOrder: (id: string, reason: string) => void;
  markOnTheWay: (id: string) => void;
  markDelivered: (id: string) => void;
  submitReview: (id: string, productId: string, rating: number, comment: string) => void;
  toggleChecklistItem: (orderId: string, index: number) => void;
  refundItem: (orderId: string, itemIndex: number, proofPhoto: string) => void;
  refundWholeOrder: (orderId: string, proofPhoto: string) => void;
  toggleSupplierChecklistItem: (orderId: string, b2bId: string, index: number) => void;
  markSentBySupplier: (orderId: string, b2bId: string) => void;
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

function loadRefunds(): RefundRecord[] {
  const raw = window.localStorage.getItem(REFUNDS_KEY);
  if (!raw) return refundSeed;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : refundSeed;
  } catch {
    return refundSeed;
  }
}

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ orders: Order[]; refunds: RefundRecord[]; ready: boolean; saveError: string | null }>({
    orders: orderSeed,
    refunds: refundSeed,
    ready: false,
    saveError: null,
  });

  // Cloud mode (Supabase configured): orders and refunds live in a shared database so a phone
  // that places an order and a desktop browser running admin see the same data, with realtime
  // push so admin doesn't need to reload. Local mode (no Supabase env vars) falls back to the
  // original per-browser localStorage behavior -- fine for a single device, but an order placed
  // there can never reach a different browser or device.
  useEffect(() => {
    if (!supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ orders: loadStored(), refunds: loadRefunds(), ready: true, saveError: null });

      const onStorage = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY) setState((s) => ({ ...s, orders: loadStored() }));
        if (e.key === REFUNDS_KEY) setState((s) => ({ ...s, refunds: loadRefunds() }));
      };
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    }

    let cancelled = false;
    const db = supabase;

    (async () => {
      const [ordersRes, refundsRes] = await Promise.all([db.from("orders").select("id, data"), db.from("refunds").select("id, data")]);
      if (cancelled) return;

      if (ordersRes.error || refundsRes.error) {
        setState((s) => ({ ...s, ready: true, saveError: CLOUD_ERROR_MESSAGE }));
        return;
      }

      const orderRows = (ordersRes.data ?? []) as OrderRow[];
      let orders: Order[];
      if (orderRows.length === 0) {
        orders = orderSeed;
        void db.from("orders").upsert(orderSeed.map((o) => ({ id: o.id, data: o })));
      } else {
        orders = orderRows.map((r) => r.data).sort((a, b) => b.createdAt - a.createdAt);
      }

      const refundRows = (refundsRes.data ?? []) as RefundRow[];
      const refunds = refundRows.map((r) => r.data).sort((a, b) => b.createdAt - a.createdAt);

      if (!cancelled) setState({ orders, refunds, ready: true, saveError: null });
    })();

    const channel = db
      .channel("orders-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        if (payload.eventType === "DELETE") return;
        const row = payload.new as unknown as OrderRow;
        setState((s) => ({
          ...s,
          orders: s.orders.some((o) => o.id === row.id) ? s.orders.map((o) => (o.id === row.id ? row.data : o)) : [row.data, ...s.orders],
        }));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "refunds" }, (payload) => {
        if (payload.eventType === "DELETE") return;
        const row = payload.new as unknown as RefundRow;
        setState((s) => ({
          ...s,
          refunds: s.refunds.some((r) => r.id === row.id) ? s.refunds.map((r) => (r.id === row.id ? row.data : r)) : [row.data, ...s.refunds],
        }));
      })
      .subscribe();

    return () => {
      cancelled = true;
      void db.removeChannel(channel);
    };
  }, []);

  const persist = (orders: Order[]): boolean => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch {
      setState((s) => ({ ...s, saveError: STORAGE_FULL_MESSAGE }));
      return false;
    }
    setState((s) => ({ ...s, orders, saveError: null }));
    return true;
  };

  const persistRefunds = (refunds: RefundRecord[]): boolean => {
    try {
      window.localStorage.setItem(REFUNDS_KEY, JSON.stringify(refunds));
    } catch {
      setState((s) => ({ ...s, saveError: STORAGE_FULL_MESSAGE }));
      return false;
    }
    setState((s) => ({ ...s, refunds, saveError: null }));
    return true;
  };

  const update = (id: string, patch: Partial<Order>) => {
    const current = state.orders.find((o) => o.id === id);
    if (!current) return;
    const patched: Order = { ...current, ...patch };

    if (supabase) {
      const db = supabase;
      setState((s) => ({ ...s, orders: s.orders.map((o) => (o.id === id ? patched : o)), saveError: null }));
      void db
        .from("orders")
        .upsert({ id, data: patched, updated_at: new Date().toISOString() })
        .then(({ error }) => {
          if (error) setState((s) => ({ ...s, saveError: CLOUD_ERROR_MESSAGE }));
        });
      return;
    }

    persist(state.orders.map((o) => (o.id === id ? patched : o)));
  };

  const placeOrder = (input: PlaceOrderInput): string => {
    const id = "ORD-" + Math.floor(2000 + Math.random() * 8000);
    const order: Order = { ...input, id, status: "Receipt Uploaded", createdAt: Date.now(), checklist: defaultChecklist(), refunded: false, refundedItems: [] };

    if (supabase) {
      const db = supabase;
      setState((s) => ({ ...s, orders: [order, ...s.orders], saveError: null }));
      void db
        .from("orders")
        .insert({ id, data: order, updated_at: new Date().toISOString() })
        .then(({ error }) => {
          if (error) setState((s) => ({ ...s, saveError: CLOUD_ERROR_MESSAGE }));
        });
    } else {
      persist([order, ...state.orders]);
    }

    notifyEvent("order_placed", order.ownerEmail, order.ownerName, { orderId: id, ownerName: order.ownerName, items: order.items, total: order.total });
    return id;
  };

  const notifyForOrder = (id: string, event: EmailEvent) => {
    const order = state.orders.find((o) => o.id === id);
    if (!order) return;
    notifyEvent(event, order.ownerEmail, order.ownerName, { orderId: order.id, ownerName: order.ownerName, total: order.total });
  };

  const addRefund = (record: Omit<RefundRecord, "id" | "createdAt">) => {
    const refund: RefundRecord = { ...record, id: "RFN-" + Math.floor(1000 + Math.random() * 9000), createdAt: Date.now() };

    if (supabase) {
      const db = supabase;
      setState((s) => ({ ...s, refunds: [refund, ...s.refunds], saveError: null }));
      void db
        .from("refunds")
        .insert({ id: refund.id, data: refund, updated_at: new Date().toISOString() })
        .then(({ error }) => {
          if (error) setState((s) => ({ ...s, saveError: CLOUD_ERROR_MESSAGE }));
        });
      return;
    }

    persistRefunds([refund, ...state.refunds]);
  };

  return (
    <OrderContext.Provider
      value={{
        orders: state.orders,
        refunds: state.refunds,
        ready: state.ready,
        saveError: state.saveError,
        placeOrder,
        approveOrder: (id) => {
          update(id, { status: "Payment Approved", approvedAt: Date.now() });
          notifyForOrder(id, "payment_approved");
        },
        rejectOrder: (id, reason) => update(id, { status: "Payment Rejected", rejectReason: reason }),
        markOnTheWay: (id) => {
          update(id, { status: "On the Way" });
          notifyForOrder(id, "order_dispatched");
        },
        markDelivered: (id) => {
          update(id, { status: "Delivered", deliveredAt: Date.now() });
          notifyForOrder(id, "order_delivered");
        },
        submitReview: (id, productId, rating, comment) => {
          const order = state.orders.find((o) => o.id === id);
          if (!order) return;
          update(id, { reviews: { ...order.reviews, [productId]: { rating, comment } } });
        },
        toggleChecklistItem: (orderId, index) => {
          const order = state.orders.find((o) => o.id === orderId);
          if (!order) return;
          update(orderId, { checklist: order.checklist.map((c, i) => (i === index ? { ...c, checked: !c.checked } : c)) });
        },
        refundItem: (orderId, itemIndex, proofPhoto) => {
          const order = state.orders.find((o) => o.id === orderId);
          if (!order) return;
          const item = order.items[itemIndex];
          if (!item) return;
          const refundId = "RFN-" + Math.floor(1000 + Math.random() * 9000);
          const remainingItems = order.items.filter((_, i) => i !== itemIndex);
          const subtotal = remainingItems.reduce((sum, it) => sum + it.price * it.qty, 0);
          update(orderId, {
            items: remainingItems,
            subtotal,
            total: subtotal + order.deliveryFee,
            refundedItems: [...order.refundedItems, { productId: item.productId, name: item.name, price: item.price * item.qty, refundId }],
          });
          addRefund({
            orderId,
            clientName: order.ownerName,
            amount: item.price * item.qty,
            type: `Item: ${item.name}`,
            proofPhoto,
            approvedBy: "Admin (You)",
          });
        },
        toggleSupplierChecklistItem: (orderId, b2bId, index) => {
          const order = state.orders.find((o) => o.id === orderId);
          if (!order) return;
          const fulfillments = order.supplierFulfillments ?? [];
          const existing = fulfillments.find((f) => f.b2bId === b2bId);
          const checklist = (existing ? existing.checklist : defaultSupplierChecklist()).map((c, i) =>
            i === index ? { ...c, checked: !c.checked } : c,
          );
          const supplierFulfillments = existing
            ? fulfillments.map((f) => (f.b2bId === b2bId ? { ...f, checklist } : f))
            : [...fulfillments, { b2bId, checklist }];
          update(orderId, { supplierFulfillments });
        },
        markSentBySupplier: (orderId, b2bId) => {
          const order = state.orders.find((o) => o.id === orderId);
          if (!order) return;
          const fulfillments = order.supplierFulfillments ?? [];
          const supplierFulfillments = fulfillments.map((f) => (f.b2bId === b2bId ? { ...f, sentAt: Date.now() } : f));
          update(orderId, { supplierFulfillments });
        },
        refundWholeOrder: (orderId, proofPhoto) => {
          const order = state.orders.find((o) => o.id === orderId);
          if (!order) return;
          update(orderId, { refunded: true });
          addRefund({
            orderId,
            clientName: order.ownerName,
            amount: order.total,
            type: "Full Order",
            proofPhoto,
            approvedBy: "Admin (You)",
          });
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
