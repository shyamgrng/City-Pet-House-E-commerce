"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useB2BAuth, ApiError } from "@/context/B2BAuthContext";

const CATEGORIES = ["Pet Food", "Pet Accessories", "Fashion Wear", "Pet Toys", "Pet Supplement", "Grooming Supplies"];

export default function B2BRegisterPage() {
  const { register } = useB2BAuth();
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
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggleCategory(cat: string) {
    setCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  }

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
        categories,
        password: form.password,
      });
      router.push("/b2b/orders");
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
        <h1 className="mb-1 text-[15px] text-text-secondary">B2B Supplier Registration</h1>
        <p className="mb-6 text-[12px] text-text-muted">
          Submit your company details below. An admin will review and approve your account before you can receive orders.
        </p>

        <form onSubmit={submit} className="grid grid-cols-2 gap-3">
          <div className="col-span-2 flex flex-col gap-1">
            <label htmlFor="reg-company" className="text-[12px] text-text-secondary">Company Name</label>
            <input
              id="reg-company"
              required
              value={form.companyName}
              onChange={(e) => setForm((s) => ({ ...s, companyName: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="reg-contact" className="text-[12px] text-text-secondary">Contact Person</label>
            <input
              id="reg-contact"
              required
              value={form.contactName}
              onChange={(e) => setForm((s) => ({ ...s, contactName: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="reg-email" className="text-[12px] text-text-secondary">Email</label>
            <input
              id="reg-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="reg-phone" className="text-[12px] text-text-secondary">Phone</label>
            <input
              id="reg-phone"
              required
              value={form.phone}
              onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="reg-altphone" className="text-[12px] text-text-secondary">Alt. Phone (optional)</label>
            <input
              id="reg-altphone"
              value={form.altPhone}
              onChange={(e) => setForm((s) => ({ ...s, altPhone: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1">
            <label htmlFor="reg-address" className="text-[12px] text-text-secondary">Business Address (optional)</label>
            <input
              id="reg-address"
              value={form.address}
              onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1">
            <span className="text-[12px] text-text-secondary">Product Categories You Supply</span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`rounded-full border px-3 py-1.5 text-[12px] font-medium ${
                    categories.includes(cat)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-text-secondary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-2 flex flex-col gap-1">
            <label htmlFor="reg-password" className="text-[12px] text-text-secondary">Password</label>
            <input
              id="reg-password"
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
          <Link href="/b2b/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
