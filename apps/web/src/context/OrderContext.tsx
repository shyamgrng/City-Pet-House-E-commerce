"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { EmailEvent } from "@/lib/email-templates";
import { notifyEvent } from "@/lib/notify-client";
import { orderSeed } from "@/lib/order-seed";
import { defaultChecklist, type Order, type OrderItem } from "@/lib/order-types";
import { refundSeed } from "@/lib/refund-seed";
import type { RefundRecord } from "@/lib/refund-types";

const STORAGE_KEY = "cph_orders";
const REFUNDS_KEY = "cph_refunds";

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
  placeOrder: (input: PlaceOrderInput) => string;
  approveOrder: (id: string) => void;
  rejectOrder: (id: string, reason: string) => void;
  markOnTheWay: (id: string) => void;
  markDelivered: (id: string) => void;
  submitReview: (id: string, productId: string, rating: number, comment: string) => void;
  toggleChecklistItem: (orderId: string, index: number) => void;
  refundItem: (orderId: string, itemIndex: number, proofPhoto: string) => void;
  refundWholeOrder: (orderId: string, proofPhoto: string) => void;
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
  const [state, setState] = useState<{ orders: Order[]; refunds: RefundRecord[]; ready: boolean }>({
    orders: orderSeed,
    refunds: refundSeed,
    ready: false,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ orders: loadStored(), refunds: loadRefunds(), ready: true });
  }, []);

  const persist = (orders: Order[]) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    setState((s) => ({ ...s, orders, ready: true }));
  };

  const persistRefunds = (refunds: RefundRecord[]) => {
    window.localStorage.setItem(REFUNDS_KEY, JSON.stringify(refunds));
    setState((s) => ({ ...s, refunds, ready: true }));
  };

  const update = (id: string, patch: Partial<Order>) => {
    persist(state.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  };

  const placeOrder = (input: PlaceOrderInput): string => {
    const id = "ORD-" + Math.floor(2000 + Math.random() * 8000);
    const order: Order = { ...input, id, status: "Receipt Uploaded", createdAt: Date.now(), checklist: defaultChecklist(), refunded: false, refundedItems: [] };
    persist([order, ...state.orders]);
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
    persistRefunds([refund, ...state.refunds]);
  };

  return (
    <OrderContext.Provider
      value={{
        orders: state.orders,
        refunds: state.refunds,
        ready: state.ready,
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
