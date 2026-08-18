"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatNPR } from "@cph/shared-types";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, uploadFile, ApiError } from "@/lib/api";

interface Doctor {
  id: string;
  displayName: string;
  qualification: string | null;
  licenseNo: string | null;
  consultFee: number;
  isOnline: boolean;
}

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

const EMPTY_BOOK_FORM = {
  petName: "",
  species: "",
  breed: "",
  age: "",
  reason: "",
  scheduledAt: "",
  isOnline: true,
};

export default function VetPage() {
  const { user, accessToken } = useAuth();
  const router = useRouter();

  const [active, setActive] = useState<boolean | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [step, setStep] = useState<"browse" | "book" | "payment" | "done">("browse");
  const [form, setForm] = useState(EMPTY_BOOK_FORM);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    if (!accessToken) {
      setBookings([]);
      return;
    }
    setBookings(await apiFetch<Booking[]>("/vet/bookings/mine", { accessToken }).catch(() => []));
  }, [accessToken]);

  useEffect(() => {
    apiFetch<{ active: boolean }>("/vet/status").then((s) => setActive(s.active));
    apiFetch<Doctor[]>("/vet/doctors").then(setDoctors).catch(() => setDoctors([]));
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  function startBooking(doctor: Doctor) {
    if (!user) {
      router.push("/account/signin?next=/vet");
      return;
    }
    setSelectedDoctor(doctor);
    setForm(EMPTY_BOOK_FORM);
    setReceiptUrl(null);
    setError(null);
    setStep("book");
  }

  function continueToPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!form.petName || !form.species || !form.reason || !form.scheduledAt) {
      setError("Please fill in all required fields.");
      return;
    }
    setError(null);
    setStep("payment");
  }

  async function handleReceiptChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { url } = await uploadFile(file);
      setReceiptUrl(url);
    } catch {
      setError("Could not upload the receipt — please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function submitBooking() {
    if (!selectedDoctor) return;
    if (!receiptUrl) {
      setError("Upload your payment receipt to continue.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch("/vet/bookings", {
        method: "POST",
        accessToken,
        body: {
          doctorId: selectedDoctor.id,
          petName: form.petName,
          species: form.species,
          breed: form.breed || undefined,
          age: form.age || undefined,
          reason: form.reason,
          scheduledAt: new Date(form.scheduledAt).toISOString(),
          isOnline: form.isOnline,
          paymentReceiptUrl: receiptUrl,
        },
      });
      await loadBookings();
      setStep("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not submit your booking — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (active === null) return null;

  if (!active) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
        <div className="mb-5 text-[52px]">🚧</div>
        <h1 className="mb-3 font-heading text-[24px] font-bold text-text-dark">Web Vet is Under Construction</h1>
        <p className="max-w-md text-[14px] leading-relaxed text-text-secondary">
          We&rsquo;re setting things up. Please check back soon, or contact us directly if you need urgent veterinary
          help.
        </p>
        <a href="tel:+9779851313717" className="mt-6 rounded-control bg-primary px-6 py-3 text-[14px] font-semibold text-white">
          Call +977 9851313717
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {step === "browse" && (
        <>
          <div className="mb-6 rounded-card border border-border bg-white p-8">
            <h1 className="mb-2 font-heading text-[20px] font-bold text-text-dark">Talk to a Certified Vet</h1>
            <p className="text-[13px] text-text-secondary">
              Book a doctor online now, or schedule a video consult in advance — pick a doctor and a time that works
              for you.
            </p>
          </div>

          <h2 className="mb-3 font-heading text-[16px] font-bold text-text-dark">Our Doctors</h2>
          {doctors.length === 0 ? (
            <p className="py-8 text-center text-[14px] text-text-muted">No doctors listed right now.</p>
          ) : (
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doc) => (
                <div key={doc.id} className="rounded-card border border-border bg-white p-4">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <span className="text-[13px] font-bold text-text-dark">{doc.displayName}</span>
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-bg-surface px-2 py-0.5 text-[10px] font-semibold">
                      <span className={`h-1.5 w-1.5 rounded-full ${doc.isOnline ? "bg-success" : "bg-text-muted"}`} />
                      {doc.isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                  {doc.qualification && <p className="mb-0.5 text-[11px] text-text-secondary">{doc.qualification}</p>}
                  {doc.licenseNo && <p className="mb-2 text-[10px] text-text-muted">NVC No: {doc.licenseNo}</p>}
                  <p className="mb-3 text-[13px] font-semibold text-text-dark">{formatNPR(doc.consultFee)} / consult</p>
                  <button
                    onClick={() => startBooking(doc)}
                    className="w-full rounded-control bg-primary py-2 text-[12px] font-semibold text-white"
                  >
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {step === "book" && selectedDoctor && (
        <div className="mx-auto max-w-xl">
          <button onClick={() => setStep("browse")} className="mb-4 text-[13px] font-semibold text-primary">
            ← Back to Web Vet
          </button>
          <h1 className="mb-1 font-heading text-[20px] font-bold text-text-dark">Book a Vet Consult</h1>
          <p className="mb-5 text-[13px] text-text-secondary">
            Doctor: <strong className="text-text-dark">{selectedDoctor.displayName}</strong> &middot;{" "}
            {formatNPR(selectedDoctor.consultFee)}
          </p>

          <form onSubmit={continueToPayment} className="flex flex-col gap-3">
            <div className="flex gap-3">
              <label className="flex flex-1 items-center gap-2 rounded-control border border-border px-3 py-2 text-[13px]">
                <input
                  type="radio"
                  checked={form.isOnline}
                  onChange={() => setForm((s) => ({ ...s, isOnline: true }))}
                />
                Online video consult
              </label>
              <label className="flex flex-1 items-center gap-2 rounded-control border border-border px-3 py-2 text-[13px]">
                <input
                  type="radio"
                  checked={!form.isOnline}
                  onChange={() => setForm((s) => ({ ...s, isOnline: false }))}
                />
                Home visit
              </label>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="vet-scheduled" className="text-[12px] font-semibold text-text-secondary">
                Preferred Date &amp; Time <span className="text-error">*</span>
              </label>
              <input
                id="vet-scheduled"
                required
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm((s) => ({ ...s, scheduledAt: e.target.value }))}
                className="rounded-control border border-border px-3 py-2 text-[13px]"
              />
            </div>

            <p className="mt-2 text-[13px] font-bold text-text-dark">Pet Details</p>
            <div className="flex gap-3">
              <div className="flex flex-1 flex-col gap-1">
                <label htmlFor="vet-pet-name" className="text-[12px] font-semibold text-text-secondary">
                  Pet Name <span className="text-error">*</span>
                </label>
                <input
                  id="vet-pet-name"
                  required
                  placeholder="e.g. Bruno"
                  value={form.petName}
                  onChange={(e) => setForm((s) => ({ ...s, petName: e.target.value }))}
                  className="rounded-control border border-border px-3 py-2 text-[13px]"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <label htmlFor="vet-species" className="text-[12px] font-semibold text-text-secondary">
                  Species &amp; Breed <span className="text-error">*</span>
                </label>
                <input
                  id="vet-species"
                  required
                  placeholder="e.g. Dog"
                  value={form.species}
                  onChange={(e) => setForm((s) => ({ ...s, species: e.target.value }))}
                  className="rounded-control border border-border px-3 py-2 text-[13px]"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="vet-breed" className="text-[12px] font-semibold text-text-secondary">
                Breed (optional)
              </label>
              <input
                id="vet-breed"
                placeholder="e.g. Labrador"
                value={form.breed}
                onChange={(e) => setForm((s) => ({ ...s, breed: e.target.value }))}
                className="rounded-control border border-border px-3 py-2 text-[13px]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="vet-age" className="text-[12px] font-semibold text-text-secondary">
                Pet Age (optional)
              </label>
              <input
                id="vet-age"
                placeholder="e.g. 2 yrs"
                value={form.age}
                onChange={(e) => setForm((s) => ({ ...s, age: e.target.value }))}
                className="rounded-control border border-border px-3 py-2 text-[13px]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="vet-reason" className="text-[12px] font-semibold text-text-secondary">
                Reason for Visit <span className="text-error">*</span>
              </label>
              <input
                id="vet-reason"
                required
                placeholder="Symptoms, checkup type, etc."
                value={form.reason}
                onChange={(e) => setForm((s) => ({ ...s, reason: e.target.value }))}
                className="rounded-control border border-border px-3 py-2 text-[13px]"
              />
            </div>

            {error && <p className="text-[12px] text-error">{error}</p>}
            <button type="submit" className="mt-2 rounded-control bg-primary py-3 text-[14px] font-semibold text-white">
              Continue to Payment
            </button>
          </form>
        </div>
      )}

      {step === "payment" && selectedDoctor && (
        <div className="mx-auto max-w-md">
          <button onClick={() => setStep("book")} className="mb-4 text-[13px] font-semibold text-primary">
            ← Back
          </button>
          <h1 className="mb-5 font-heading text-[20px] font-bold text-text-dark">Payment</h1>

          <div className="mb-5 flex items-center gap-4 rounded-card border border-border bg-white p-5">
            <Image src="/fonepay-qr.png" alt="Fonepay QR code" width={130} height={130} className="rounded-control border border-border" />
            <p className="text-[12px] text-text-secondary">
              Scan with your banking app, pay <strong className="text-text-dark">{formatNPR(selectedDoctor.consultFee)}</strong>, then
              upload a screenshot of the receipt below.
            </p>
          </div>

          <label className="mb-1 block text-[12px] text-text-secondary">Payment receipt</label>
          <input type="file" accept="image/*,application/pdf" onChange={handleReceiptChange} className="text-[13px]" />
          {uploading && <p className="mt-1 text-[12px] text-text-muted">Uploading…</p>}
          {receiptUrl && <p className="mt-1 text-[12px] text-success">Receipt uploaded ✓</p>}

          {error && <p className="mt-3 text-[12px] text-error">{error}</p>}
          <button
            onClick={submitBooking}
            disabled={submitting}
            className="mt-5 w-full rounded-control bg-primary py-3 text-[14px] font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit Booking"}
          </button>
        </div>
      )}

      {step === "done" && (
        <div className="mx-auto flex max-w-md flex-col items-center py-12 text-center">
          <div className="mb-4 text-[44px]">✅</div>
          <h1 className="mb-2 font-heading text-[20px] font-bold text-text-dark">Booking Submitted</h1>
          <p className="mb-6 text-[13px] text-text-secondary">
            We&rsquo;ll review your payment and confirm your consult shortly. You can track its status below.
          </p>
          <button onClick={() => setStep("browse")} className="rounded-control border border-primary px-5 py-2 text-[13px] font-semibold text-primary">
            Book Another Consult
          </button>
        </div>
      )}

      {user && bookings.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-3 font-heading text-[16px] font-bold text-text-dark">My Bookings</h2>
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
        </div>
      )}
    </div>
  );
}
