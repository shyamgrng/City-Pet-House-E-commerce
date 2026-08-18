"use client";

import { useCallback, useEffect, useState } from "react";
import { formatNPR } from "@cph/shared-types";
import { useDoctorAuth, ApiError } from "@/context/DoctorAuthContext";
import { apiFetch } from "@/lib/api";

interface Booking {
  id: string;
  status: "PENDING_PAYMENT" | "PAYMENT_APPROVED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  scheduledAt: string;
  reason: string;
  amount: number;
  isOnline: boolean;
  invoiceNumber: string | null;
  owner: { name: string };
  pet: { name: string; species: string; breed: string | null };
}

type Tab = "PENDING_PAYMENT" | "PAYMENT_APPROVED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

const TABS: { key: Tab; label: string }[] = [
  { key: "PENDING_PAYMENT", label: "Awaiting Payment" },
  { key: "PAYMENT_APPROVED", label: "Ready to Confirm" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
];

export default function DoctorConsultsPage() {
  const { accessToken } = useDoctorAuth();
  const [tab, setTab] = useState<Tab>("PAYMENT_APPROVED");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      setBookings(await apiFetch<Booking[]>(`/doctor/bookings?status=${tab}`, { accessToken }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load your consults.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, tab]);

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

  const confirmBooking = (id: string) =>
    runAction(id, () => apiFetch(`/doctor/bookings/${id}/confirm`, { method: "POST", accessToken }));
  const completeBooking = (id: string) =>
    runAction(id, () => apiFetch(`/doctor/bookings/${id}/complete`, { method: "POST", accessToken }));

  return (
    <div>
      <h1 className="mb-6 text-[22px]">My Consults</h1>

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

      {error && <p className="mb-4 text-[13px] text-error">{error}</p>}

      {loading ? (
        <p className="text-[13px] text-text-muted">Loading…</p>
      ) : bookings.length === 0 ? (
        <p className="text-[13px] text-text-muted">Nothing here.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {bookings.map((b) => (
            <div key={b.id} className="rounded-card border border-border bg-white p-5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[14px] font-semibold text-text-dark">{b.owner.name}</span>
                <span className="text-[12px] text-text-muted">{new Date(b.scheduledAt).toLocaleString()}</span>
              </div>
              <p className="mb-2 text-[12px] text-text-secondary">
                Pet: {b.pet.name} ({b.pet.species}
                {b.pet.breed ? ` — ${b.pet.breed}` : ""}) &middot; {b.isOnline ? "Online video consult" : "Home visit"}
              </p>
              <p className="mb-3 text-[13px] text-text-secondary">{b.reason}</p>

              <div className="mb-3 flex gap-6 text-[12px] text-text-secondary">
                <span>
                  <span className="text-text-muted">Fee: </span>
                  <span className="font-medium text-text-dark">{formatNPR(b.amount)}</span>
                </span>
                {b.invoiceNumber && (
                  <span>
                    <span className="text-text-muted">Invoice: </span>
                    <span className="font-medium text-text-dark">{b.invoiceNumber}</span>
                  </span>
                )}
              </div>

              {tab === "PAYMENT_APPROVED" && (
                <button
                  onClick={() => confirmBooking(b.id)}
                  disabled={busyId === b.id}
                  className="rounded-control bg-primary px-4 py-2 text-[12px] font-semibold text-white disabled:opacity-60"
                >
                  Confirm Consult
                </button>
              )}
              {tab === "CONFIRMED" && (
                <button
                  onClick={() => completeBooking(b.id)}
                  disabled={busyId === b.id}
                  className="rounded-control bg-success px-4 py-2 text-[12px] font-semibold text-white disabled:opacity-60"
                >
                  Mark Completed
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
