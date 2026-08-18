"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCourierAuth, ApiError } from "@/context/CourierAuthContext";

export default function CourierRegisterPage() {
  const { register } = useCourierAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    altPhone: "",
    address: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({
        companyName: form.companyName,
        contactName: form.contactName,
        email: form.email,
        phone: form.phone,
        altPhone: form.altPhone.trim() || undefined,
        address: form.address.trim() || undefined,
        password: form.password,
      });
      router.push("/courier/assignments");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg rounded-card border border-border bg-white p-8 shadow-panel">
        <p className="mb-1 font-heading text-[18px] font-bold text-text-dark">City Pet House</p>
        <h1 className="mb-1 text-[15px] text-text-secondary">Courier Partner Registration</h1>
        <p className="mb-6 text-[12px] text-text-muted">
          Submit your company details below. An admin will review and approve your account before you can receive delivery assignments.
        </p>

        <form onSubmit={submit} className="grid grid-cols-2 gap-3">
          <div className="col-span-2 flex flex-col gap-1">
            <label htmlFor="creg-company" className="text-[12px] text-text-secondary">Company Name</label>
            <input
              id="creg-company"
              required
              value={form.companyName}
              onChange={(e) => setForm((s) => ({ ...s, companyName: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="creg-contact" className="text-[12px] text-text-secondary">Contact Person</label>
            <input
              id="creg-contact"
              required
              value={form.contactName}
              onChange={(e) => setForm((s) => ({ ...s, contactName: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="creg-email" className="text-[12px] text-text-secondary">Email</label>
            <input
              id="creg-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="creg-phone" className="text-[12px] text-text-secondary">Phone</label>
            <input
              id="creg-phone"
              required
              value={form.phone}
              onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="creg-altphone" className="text-[12px] text-text-secondary">Alt. Phone (optional)</label>
            <input
              id="creg-altphone"
              value={form.altPhone}
              onChange={(e) => setForm((s) => ({ ...s, altPhone: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1">
            <label htmlFor="creg-address" className="text-[12px] text-text-secondary">Business Address (optional)</label>
            <input
              id="creg-address"
              value={form.address}
              onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1">
            <label htmlFor="creg-password" className="text-[12px] text-text-secondary">Password</label>
            <input
              id="creg-password"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>

          {error && <p className="col-span-2 text-[12px] text-error">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="col-span-2 mt-2 rounded-control bg-primary px-5 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit Registration"}
          </button>
        </form>

        <p className="mt-5 text-center text-[12px] text-text-secondary">
          Already registered?{" "}
          <Link href="/courier/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
