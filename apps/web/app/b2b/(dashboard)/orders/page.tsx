"use client";

import { useCallback, useEffect, useState } from "react";
import { formatNPR } from "@cph/shared-types";
import { useB2BAuth, ApiError } from "@/context/B2BAuthContext";
import { apiFetch } from "@/lib/api";

interface IncomingOrderItem {
  id: string;
  nameSnapshot: string;
  priceSnapshot: number;
  qty: number;
  outOfStock: boolean;
  refundRequested: boolean;
  sentToCph: boolean;
  product: { name: string; images: string[] } | null;
  order: {
    id: string;
    stage: string;
    paymentStatus: string;
    createdAt: string;
    checklist: { id: string; label: string; checked: boolean }[];
    buyer: { name: string };
  };
}

export default function B2BOrdersPage() {
  const { accessToken } = useB2BAuth();
  const [items, setItems] = useState<IncomingOrderItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setItems(await apiFetch<IncomingOrderItem[]>("/b2b/incoming-orders", { accessToken }));
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  async function runAction(id: string, action: () => Promise<unknown>) {
    setBusyId(id);
    setError(null);
    try {
      await action();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That action failed.");
    } finally {
      setBusyId(null);
    }
  }

  function markOutOfStock(id: string) {
    return runAction(id, () => apiFetch(`/b2b/order-items/${id}/out-of-stock`, { method: "POST", accessToken }));
  }

  function sendRefund(id: string) {
    const reason = window.prompt("Reason for this refund:");
    if (!reason) return;
    return runAction(id, () =>
      apiFetch(`/b2b/order-items/${id}/send-refund`, { method: "POST", accessToken, body: { reason } }),
    );
  }

  function markSent(id: string) {
    return runAction(id, () => apiFetch(`/b2b/order-items/${id}/mark-sent`, { method: "POST", accessToken }));
  }

  return (
    <div>
      <h1 className="mb-6 text-[22px]">Incoming Orders</h1>
      {error && <p className="mb-4 text-[13px] text-error">{error}</p>}

      {!items ? (
        <p className="text-[13px] text-text-muted">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-[13px] text-text-muted">No orders yet for your products.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => {
            const checklistDone = item.order.checklist.length > 0 && item.order.checklist.every((c) => c.checked);
            return (
              <div key={item.id} className="rounded-card border border-border bg-white p-5">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[14px] font-semibold text-text-dark">{item.order.id}</span>
                  <span className="text-[12px] text-text-muted">{new Date(item.order.createdAt).toLocaleString()}</span>
                </div>
                <p className="mb-2 text-[12px] text-text-secondary">
                  Buyer: {item.order.buyer.name} &middot; Stage: {item.order.stage} &middot; Payment: {item.order.paymentStatus}
                </p>
                <p className="mb-3 text-[13px] text-text-dark">
                  {item.nameSnapshot} &times; {item.qty} — <span className="font-medium">{formatNPR(item.priceSnapshot * item.qty)}</span>
                </p>

                <div className="mb-3 flex flex-wrap gap-2">
                  {item.outOfStock && (
                    <span className="rounded-full bg-error/10 px-2.5 py-1 text-[11px] font-semibold text-error">Out of Stock</span>
                  )}
                  {item.refundRequested && (
                    <span className="rounded-full bg-[#F59E0B]/10 px-2.5 py-1 text-[11px] font-semibold text-[#F59E0B]">Refund Requested</span>
                  )}
                  {item.sentToCph && (
                    <span className="rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success">Sent to CPH</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {!item.outOfStock && (
                    <button
                      onClick={() => markOutOfStock(item.id)}
                      disabled={busyId === item.id}
                      className="rounded-control border border-border px-3 py-1.5 text-[12px] font-medium disabled:opacity-60"
                    >
                      Mark Out of Stock
                    </button>
                  )}
                  {item.outOfStock && !item.refundRequested && (
                    <button
                      onClick={() => sendRefund(item.id)}
                      disabled={busyId === item.id}
                      className="rounded-control border border-error px-3 py-1.5 text-[12px] font-medium text-error disabled:opacity-60"
                    >
                      Send for Refund
                    </button>
                  )}
                  {!item.sentToCph && (
                    <button
                      onClick={() => markSent(item.id)}
                      disabled={busyId === item.id || !checklistDone}
                      title={!checklistDone ? "Available once the order's fulfillment checklist is fully checked" : undefined}
                      className="rounded-control bg-primary px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-40"
                    >
                      Mark Sent to CPH
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
