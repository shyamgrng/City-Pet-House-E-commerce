"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { apiFetch, ApiError } from "@/lib/api";
import { AdminOrder } from "@/lib/admin-types";
import { AdminOrderCard } from "@/components/admin/AdminOrderCard";

type Tab = "payment-queue" | "orders" | "dispatch" | "delivery" | "cancelled";

const TABS: { key: Tab; label: string }[] = [
  { key: "payment-queue", label: "Payment Queue" },
  { key: "orders", label: "Orders" },
  { key: "dispatch", label: "Dispatch" },
  { key: "delivery", label: "Delivery" },
  { key: "cancelled", label: "Cancelled" },
];

export default function DeliveriesPage() {
  const { accessToken } = useAdminAuth();
  const [tab, setTab] = useState<Tab>("payment-queue");
  const [showRejected, setShowRejected] = useState(false);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [delivered, setDelivered] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      if (tab === "payment-queue") {
        const params = showRejected ? "paymentStatus=REJECTED" : "paymentStatus=PENDING_REVIEW";
        setOrders(await apiFetch<AdminOrder[]>(`/admin/orders?${params}`, { accessToken }));
      } else if (tab === "orders") {
        setOrders(await apiFetch<AdminOrder[]>("/admin/orders?stage=CONFIRMED", { accessToken }));
      } else if (tab === "dispatch") {
        setOrders(await apiFetch<AdminOrder[]>("/admin/orders?stage=DISPATCH", { accessToken }));
      } else if (tab === "delivery") {
        const [outForDelivery, deliveredList] = await Promise.all([
          apiFetch<AdminOrder[]>("/admin/orders?stage=OUT_FOR_DELIVERY", { accessToken }),
          apiFetch<AdminOrder[]>("/admin/orders?stage=DELIVERED", { accessToken }),
        ]);
        setOrders(outForDelivery);
        setDelivered(deliveredList);
      } else if (tab === "cancelled") {
        setOrders(await apiFetch<AdminOrder[]>("/admin/orders?stage=CANCELLED", { accessToken }));
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load orders.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, tab, showRejected]);

  useEffect(() => {
    load();
  }, [load]);

  async function runAction(orderId: string, action: () => Promise<unknown>) {
    setBusyId(orderId);
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

  const approvePayment = (id: string) =>
    runAction(id, () => apiFetch(`/admin/orders/${id}/approve-payment`, { method: "POST", accessToken }));

  const rejectPayment = (id: string) => {
    const reason = window.prompt("Reason for rejecting this payment:");
    if (!reason) return;
    return runAction(id, () =>
      apiFetch(`/admin/orders/${id}/reject-payment`, { method: "POST", accessToken, body: { reason } }),
    );
  };

  // Optimistic: a checklist tick should latch instantly, not flicker back
  // to unchecked for the round trip — unlike the other actions here, this
  // one doesn't move the order to a different tab, so the user stays
  // looking right at it.
  async function toggleChecklist(orderId: string, itemId: string, checked: boolean) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, checklist: o.checklist.map((c) => (c.id === itemId ? { ...c, checked } : c)) }
          : o,
      ),
    );
    try {
      await apiFetch(`/admin/orders/${orderId}/checklist/${itemId}`, {
        method: "PATCH",
        accessToken,
        body: { checked },
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update the checklist.");
      await load(); // revert to server truth
    }
  }

  const dispatch = (id: string) =>
    runAction(id, () => apiFetch(`/admin/orders/${id}/dispatch`, { method: "POST", accessToken }));

  const markOutForDelivery = (id: string) =>
    runAction(id, () => apiFetch(`/admin/orders/${id}/mark-out-for-delivery`, { method: "POST", accessToken }));

  const markDelivered = (id: string) =>
    runAction(id, () => apiFetch(`/admin/orders/${id}/mark-delivered`, { method: "POST", accessToken }));

  const cancelOrder = (id: string) => {
    const reason = window.prompt("Reason for cancelling this order:");
    if (!reason) return;
    return runAction(id, () => apiFetch(`/admin/orders/${id}/cancel`, { method: "POST", accessToken, body: { reason } }));
  };

  return (
    <div>
      <h1 className="mb-6 text-[22px]">Deliveries</h1>

      <div className="mb-6 flex gap-2 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-[13px] font-medium ${
              tab === t.key ? "border-b-2 border-primary text-primary" : "text-text-secondary hover:text-primary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "payment-queue" && (
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setShowRejected(false)}
            className={`rounded-full px-3 py-1 text-[12px] font-medium ${!showRejected ? "bg-primary text-white" : "border border-border text-text-secondary"}`}
          >
            Pending
          </button>
          <button
            onClick={() => setShowRejected(true)}
            className={`rounded-full px-3 py-1 text-[12px] font-medium ${showRejected ? "bg-primary text-white" : "border border-border text-text-secondary"}`}
          >
            Rejected
          </button>
        </div>
      )}

      {error && <p className="mb-4 text-[13px] text-error">{error}</p>}

      {loading ? (
        <p className="text-[13px] text-text-muted">Loading…</p>
      ) : (
        <div className="flex flex-col gap-4">
          {tab === "payment-queue" &&
            (orders.length === 0 ? (
              <p className="text-[13px] text-text-muted">Nothing here.</p>
            ) : (
              orders.map((order) => (
                <AdminOrderCard key={order.id} order={order} showReceipt>
                  {!showRejected && (
                    <>
                      <button
                        onClick={() => approvePayment(order.id)}
                        disabled={busyId === order.id}
                        className="rounded-control bg-success px-4 py-2 text-[12px] font-semibold text-white disabled:opacity-60"
                      >
                        Approve Payment
                      </button>
                      <button
                        onClick={() => rejectPayment(order.id)}
                        disabled={busyId === order.id}
                        className="rounded-control border border-error px-4 py-2 text-[12px] font-semibold text-error disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </AdminOrderCard>
              ))
            ))}

          {tab === "orders" &&
            (orders.length === 0 ? (
              <p className="text-[13px] text-text-muted">Nothing here.</p>
            ) : (
              orders.map((order) => {
                const allChecked = order.checklist.every((c) => c.checked);
                return (
                  <AdminOrderCard
                    key={order.id}
                    order={order}
                    showChecklist={
                      <div className="mb-3 flex flex-col gap-1.5 border-t border-border pt-3">
                        {order.checklist.map((item) => (
                          <label key={item.id} className="flex items-center gap-2 text-[13px] text-text-secondary">
                            <input
                              type="checkbox"
                              checked={item.checked}
                              onChange={(e) => toggleChecklist(order.id, item.id, e.target.checked)}
                            />
                            {item.label}
                          </label>
                        ))}
                      </div>
                    }
                  >
                    <button
                      onClick={() => dispatch(order.id)}
                      disabled={!allChecked || busyId === order.id}
                      className="rounded-control bg-primary px-4 py-2 text-[12px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Dispatch
                    </button>
                    <button
                      onClick={() => cancelOrder(order.id)}
                      disabled={busyId === order.id}
                      className="rounded-control border border-error px-4 py-2 text-[12px] font-semibold text-error disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </AdminOrderCard>
                );
              })
            ))}

          {tab === "dispatch" &&
            (orders.length === 0 ? (
              <p className="text-[13px] text-text-muted">Nothing here.</p>
            ) : (
              orders.map((order) => (
                <AdminOrderCard key={order.id} order={order}>
                  <button
                    onClick={() => markOutForDelivery(order.id)}
                    disabled={busyId === order.id}
                    className="rounded-control bg-primary px-4 py-2 text-[12px] font-semibold text-white disabled:opacity-60"
                  >
                    Mark Out for Delivery
                  </button>
                  <button
                    onClick={() => cancelOrder(order.id)}
                    disabled={busyId === order.id}
                    className="rounded-control border border-error px-4 py-2 text-[12px] font-semibold text-error disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </AdminOrderCard>
              ))
            ))}

          {tab === "delivery" && (
            <>
              {orders.length === 0 && delivered.length === 0 ? (
                <p className="text-[13px] text-text-muted">Nothing here.</p>
              ) : (
                <>
                  {orders.map((order) => (
                    <AdminOrderCard key={order.id} order={order}>
                      <button
                        onClick={() => markDelivered(order.id)}
                        disabled={busyId === order.id}
                        className="rounded-control bg-success px-4 py-2 text-[12px] font-semibold text-white disabled:opacity-60"
                      >
                        Mark Delivered
                      </button>
                    </AdminOrderCard>
                  ))}
                  {delivered.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-3 text-[13px] font-semibold text-text-dark">Recently Delivered</p>
                      <div className="flex flex-col gap-3">
                        {delivered.map((order) => (
                          <AdminOrderCard key={order.id} order={order} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {tab === "cancelled" &&
            (orders.length === 0 ? (
              <p className="text-[13px] text-text-muted">Nothing here.</p>
            ) : (
              orders.map((order) => <AdminOrderCard key={order.id} order={order} />)
            ))}
        </div>
      )}
    </div>
  );
}
