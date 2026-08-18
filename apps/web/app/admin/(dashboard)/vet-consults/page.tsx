"use client";

import { useCallback, useEffect, useState } from "react";
import { formatNPR } from "@cph/shared-types";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { apiFetch, resolveUploadUrl, ApiError } from "@/lib/api";

interface Booking {
  id: string;
  status: "PENDING_PAYMENT" | "PAYMENT_APPROVED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  scheduledAt: string;
  reason: string;
  amount: number;
  isOnline: boolean;
  invoiceNumber: string | null;
  paymentReceiptUrl: string | null;
  owner: { name: string };
  doctor: { displayName: string; consultFee: number };
  pet: { name: string; species: string; breed: string | null };
}

type Tab = "PENDING_PAYMENT" | "PAYMENT_APPROVED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

const TABS: { key: Tab; label: string }[] = [
  { key: "PENDING_PAYMENT", label: "Pending Payment" },
  { key: "PAYMENT_APPROVED", label: "Payment Approved" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
];

export default function AdminVetConsultsPage() {
  const { accessToken } = useAdminAuth();
  const [tab, setTab] = useState<Tab>("PENDING_PAYMENT");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [webVetActive, setWebVetActive] = useState<boolean | null>(null);
  const [togglingSetting, setTogglingSetting] = useState(false);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      setBookings(await apiFetch<Booking[]>(`/admin/vet-consults?status=${tab}`, { accessToken }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load bookings.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, tab]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!accessToken) return;
    apiFetch<{ active: boolean }>("/admin/vet-consults/settings", { accessToken }).then((s) => setWebVetActive(s.active));
  }, [accessToken]);

  async function toggleWebVetActive() {
    if (webVetActive === null) return;
    setTogglingSetting(true);
    try {
      const next = !webVetActive;
      await apiFetch("/admin/vet-consults/settings", { method: "PATCH", accessToken, body: { active: next } });
      setWebVetActive(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update the Web Vet setting.");
    } finally {
      setTogglingSetting(false);
    }
  }

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

  const approvePayment = (id: string) =>
    runAction(id, () => apiFetch(`/admin/vet-consults/${id}/approve-payment`, { method: "POST", accessToken }));
  const rejectPayment = (id: string) =>
    runAction(id, () => apiFetch(`/admin/vet-consults/${id}/reject-payment`, { method: "POST", accessToken }));
  const confirmBooking = (id: string) =>
    runAction(id, () => apiFetch(`/admin/vet-consults/${id}/confirm`, { method: "POST", accessToken }));
  const completeBooking = (id: string) =>
    runAction(id, () => apiFetch(`/admin/vet-consults/${id}/complete`, { method: "POST", accessToken }));
  const cancelBooking = (id: string) => {
    if (!window.confirm("Cancel this booking?")) return;
    return runAction(id, () => apiFetch(`/admin/vet-consults/${id}/cancel`, { method: "POST", accessToken }));
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[22px]">Vet Consults</h1>
        {webVetActive !== null && (
          <button
            onClick={toggleWebVetActive}
            disabled={togglingSetting}
            className="flex items-center gap-2 rounded-control border border-border bg-white px-3 py-2 text-[12px] font-semibold disabled:opacity-60"
          >
            <span className={webVetActive ? "text-success" : "text-text-muted"}>
              Web Vet: {webVetActive ? "Active" : "Inactive"}
            </span>
            <span
              className={`relative inline-block h-[22px] w-[38px] rounded-full transition-colors ${
                webVetActive ? "bg-success" : "bg-border"
              }`}
            >
              <span
                className={`absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white transition-all ${
                  webVetActive ? "left-[18px]" : "left-0.5"
                }`}
              />
            </span>
          </button>
        )}
      </div>
      {webVetActive === false && (
        <p className="mb-4 text-[12px] text-text-muted">
          Hidden — clients see an &ldquo;Under Construction&rdquo; notice instead of the booking page.
        </p>
      )}

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
                <span className="text-[14px] font-semibold text-text-dark">
                  {b.doctor.displayName} &middot; {b.owner.name}
                </span>
                <span className="text-[12px] text-text-muted">{new Date(b.scheduledAt).toLocaleString()}</span>
              </div>
              <p className="mb-2 text-[12px] text-text-secondary">
                Pet: {b.pet.name} ({b.pet.species}
                {b.pet.breed ? ` — ${b.pet.breed}` : ""}) &middot; {b.isOnline ? "Online video consult" : "Home visit"}
              </p>
              <p className="mb-3 text-[13px] text-text-secondary">{b.reason}</p>

              <div className="mb-3 grid grid-cols-2 gap-2 rounded-control bg-bg-surface p-3 text-[12px] text-text-secondary sm:grid-cols-4">
                <div>
                  <p className="text-text-muted">Amount</p>
                  <p className="font-medium text-text-dark">{formatNPR(b.amount)}</p>
                </div>
                <div>
                  <p className="text-text-muted">Invoice</p>
                  <p className="font-medium text-text-dark">{b.invoiceNumber ?? "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-text-muted">Payment receipt</p>
                  {b.paymentReceiptUrl ? (
                    <a
                      href={resolveUploadUrl(b.paymentReceiptUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      View receipt
                    </a>
                  ) : (
                    <p className="font-medium text-text-dark">Not uploaded</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {tab === "PENDING_PAYMENT" && (
                  <>
                    <button
                      onClick={() => approvePayment(b.id)}
                      disabled={busyId === b.id}
                      className="rounded-control bg-success px-4 py-2 text-[12px] font-semibold text-white disabled:opacity-60"
                    >
                      Approve Payment
                    </button>
                    <button
                      onClick={() => rejectPayment(b.id)}
                      disabled={busyId === b.id}
                      className="rounded-control border border-error px-4 py-2 text-[12px] font-semibold text-error disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </>
                )}
                {tab === "PAYMENT_APPROVED" && (
                  <button
                    onClick={() => confirmBooking(b.id)}
                    disabled={busyId === b.id}
                    className="rounded-control bg-primary px-4 py-2 text-[12px] font-semibold text-white disabled:opacity-60"
                  >
                    Confirm Booking
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
                {(tab === "PENDING_PAYMENT" || tab === "PAYMENT_APPROVED" || tab === "CONFIRMED") && (
                  <button
                    onClick={() => cancelBooking(b.id)}
                    disabled={busyId === b.id}
                    className="rounded-control border border-error px-4 py-2 text-[12px] font-semibold text-error disabled:opacity-60"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
