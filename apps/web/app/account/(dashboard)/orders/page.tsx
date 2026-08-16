"use client";

import { useEffect, useState } from "react";
import { formatNPR } from "@cph/shared-types";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";

interface OrderItem {
  id: string;
  nameSnapshot: string;
  priceSnapshot: number;
  qty: number;
  outOfStock: boolean;
  refundRequested: boolean;
}

interface StatusEvent {
  stage: string;
  at: string;
}

interface Order {
  id: string;
  stage: string;
  paymentStatus: string;
  amount: number;
  deliveryFee: number;
  createdAt: string;
  items: OrderItem[];
  statusHistory: StatusEvent[];
}

const STAGE_LABEL: Record<string, string> = {
  PAYMENT_QUEUE: "Payment Under Review",
  CONFIRMED: "Confirmed",
  DISPATCH: "Preparing Dispatch",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default function OrdersPage() {
  const { accessToken } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    apiFetch<Order[]>("/orders/mine", { accessToken }).then(setOrders);
  }, [accessToken]);

  if (!orders) return <p className="text-[13px] text-text-muted">Loading orders…</p>;
  if (orders.length === 0) return <p className="text-[13px] text-text-muted">You haven&apos;t placed any orders yet.</p>;

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <div key={order.id} className="rounded-card border border-border bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[14px] font-semibold text-text-dark">{order.id}</p>
              <p className="text-[12px] text-text-muted">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-[12px] font-semibold text-primary">
              {STAGE_LABEL[order.stage] ?? order.stage}
            </span>
          </div>

          <div className="mb-3 flex flex-col gap-1">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-[13px] text-text-secondary">
                <span>
                  {item.nameSnapshot} &times; {item.qty}
                  {item.outOfStock && <span className="ml-2 text-[11px] font-medium text-error">Out of stock</span>}
                  {item.refundRequested && <span className="ml-2 text-[11px] font-medium text-ai-accent">Refund requested</span>}
                </span>
                <span>{formatNPR(item.priceSnapshot * item.qty)}</span>
              </div>
            ))}
          </div>

          <div className="mb-3 flex justify-between border-t border-border pt-2 text-[13px] font-semibold text-text-dark">
            <span>Total ({order.paymentStatus === "APPROVED" ? "payment approved" : "payment pending review"})</span>
            <span>{formatNPR(order.amount + order.deliveryFee)}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {order.statusHistory.map((event, i) => (
              <span key={i} className="rounded-control bg-bg-surface px-2 py-1 text-[11px] text-text-muted">
                {STAGE_LABEL[event.stage] ?? event.stage} &middot; {new Date(event.at).toLocaleString()}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
