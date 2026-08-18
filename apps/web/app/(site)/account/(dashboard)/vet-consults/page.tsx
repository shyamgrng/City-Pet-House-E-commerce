"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatNPR } from "@cph/shared-types";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";

interface Booking {
  id: string;
  status: "PENDING_PAYMENT" | "PAYMENT_APPROVED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  scheduledAt: string;
  reason: string;
  amount: number;
  isOnline: boolean;
  invoiceNumber: string | null;
  doctor: { displayName: string };
  pet: { name: string; species: string; breed: string | null };
}

const STATUS_LABELS: Record<Booking["status"], { label: string; className: string }> = {
  PENDING_PAYMENT: { label: "Pending Payment Review", className: "bg-[#F59E0B]/10 text-[#F59E0B]" },
  PAYMENT_APPROVED: { label: "Payment Approved", className: "bg-primary/10 text-primary" },
  CONFIRMED: { label: "Confirmed", className: "bg-success/10 text-success" },
  COMPLETED: { label: "Completed", className: "bg-text-muted/10 text-text-muted" },
  CANCELLED: { label: "Cancelled", className: "bg-error/10 text-error" },
};

export default function AccountVetConsultsPage() {
  const { accessToken } = useAuth();
  const [bookings, setBookings] = useState<Booking[] | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    apiFetch<Booking[]>("/vet/bookings/mine", { accessToken }).then(setBookings);
  }, [accessToken]);

  if (!bookings) return <p className="text-[13px] text-text-muted">Loading…</p>;

  if (bookings.length === 0) {
    return (
      <p className="text-[13px] text-text-muted">
        No vet consult bookings yet.{" "}
        <Link href="/vet" className="font-semibold text-primary hover:underline">
          Book one now →
        </Link>
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {bookings.map((b) => (
        <div key={b.id} className="rounded-card border border-border bg-white p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[13px] font-semibold text-text-dark">
              {b.doctor.displayName} &middot; {b.pet.name}
            </span>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_LABELS[b.status].className}`}>
              {STATUS_LABELS[b.status].label}
            </span>
          </div>
          <p className="mb-1 text-[12px] text-text-secondary">{b.reason}</p>
          <p className="text-[12px] text-text-muted">
            {new Date(b.scheduledAt).toLocaleString()} &middot; {b.isOnline ? "Online video consult" : "Home visit"} &middot;{" "}
            {formatNPR(b.amount)}
            {b.invoiceNumber ? ` · Invoice ${b.invoiceNumber}` : ""}
          </p>
        </div>
      ))}
    </div>
  );
}
