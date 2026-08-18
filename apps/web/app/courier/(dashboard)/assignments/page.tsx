"use client";

import { useCallback, useEffect, useState } from "react";
import { formatNPR } from "@cph/shared-types";
import { useCourierAuth, ApiError } from "@/context/CourierAuthContext";
import { apiFetch } from "@/lib/api";

interface Assignment {
  id: string;
  assignedAt: string;
  receivedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  order: {
    id: string;
    stage: string;
    addressSnapshot: { label: string; address: string; phone: string; altPhone: string | null };
    amount: number;
    deliveryFee: number;
    paymentMethod: string;
    buyer: { name: string };
    items: { nameSnapshot: string; qty: number }[];
  };
}

export default function CourierAssignmentsPage() {
  const { accessToken } = useCourierAuth();
  const [assignments, setAssignments] = useState<Assignment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setAssignments(await apiFetch<Assignment[]>("/courier/assignments", { accessToken }));
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

  const receive = (id: string) =>
    runAction(id, () => apiFetch(`/courier/assignments/${id}/receive`, { method: "POST", accessToken }));
  const deliver = (id: string) =>
    runAction(id, () => apiFetch(`/courier/assignments/${id}/deliver`, { method: "POST", accessToken }));

  function cancel(id: string) {
    const reason = window.prompt("Reason for cancelling this delivery:");
    if (!reason) return;
    return runAction(id, () =>
      apiFetch(`/courier/assignments/${id}/cancel`, { method: "POST", accessToken, body: { reason } }),
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-[22px]">Delivery Assignments</h1>
      {error && <p className="mb-4 text-[13px] text-error">{error}</p>}

      {!assignments ? (
        <p className="text-[13px] text-text-muted">Loading…</p>
      ) : assignments.length === 0 ? (
        <p className="text-[13px] text-text-muted">No delivery assignments yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {assignments.map((a) => (
            <div key={a.id} className="rounded-card border border-border bg-white p-5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[14px] font-semibold text-text-dark">{a.order.id}</span>
                <span className="text-[12px] text-text-muted">Assigned {new Date(a.assignedAt).toLocaleString()}</span>
              </div>
              <p className="mb-1 text-[13px] font-medium text-text-dark">{a.order.buyer.name}</p>
              <p className="mb-2 text-[12px] text-text-secondary">
                {a.order.addressSnapshot.address} &middot; {a.order.addressSnapshot.phone}
              </p>
              <p className="mb-3 text-[12px] text-text-secondary">
                {a.order.items.map((it) => `${it.nameSnapshot} ×${it.qty}`).join(", ")} —{" "}
                <span className="font-medium text-text-dark">{formatNPR(a.order.amount + a.order.deliveryFee)}</span> ({a.order.paymentMethod})
              </p>

              <div className="mb-3 flex flex-wrap gap-2">
                {a.cancelledAt && (
                  <span className="rounded-full bg-error/10 px-2.5 py-1 text-[11px] font-semibold text-error">
                    Cancelled: {a.cancellationReason}
                  </span>
                )}
                {a.receivedAt && !a.cancelledAt && (
                  <span className="rounded-full bg-[#F59E0B]/10 px-2.5 py-1 text-[11px] font-semibold text-[#F59E0B]">Picked Up</span>
                )}
                {a.deliveredAt && (
                  <span className="rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success">Delivered</span>
                )}
              </div>

              {!a.cancelledAt && !a.deliveredAt && (
                <div className="flex flex-wrap gap-2">
                  {!a.receivedAt && (
                    <button
                      onClick={() => receive(a.id)}
                      disabled={busyId === a.id}
                      className="rounded-control bg-primary px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-60"
                    >
                      Mark Received
                    </button>
                  )}
                  {a.receivedAt && (
                    <button
                      onClick={() => deliver(a.id)}
                      disabled={busyId === a.id}
                      className="rounded-control bg-success px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-60"
                    >
                      Mark Delivered
                    </button>
                  )}
                  <button
                    onClick={() => cancel(a.id)}
                    disabled={busyId === a.id}
                    className="rounded-control border border-error px-3 py-1.5 text-[12px] font-medium text-error disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
