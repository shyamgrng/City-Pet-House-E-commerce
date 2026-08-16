"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";

interface Address {
  id: string;
  label: string;
  address: string;
  phone: string;
  altPhone: string | null;
  isPrimary: boolean;
}

const EMPTY_FORM = { label: "", address: "", phone: "", altPhone: "" };

export default function AddressesPage() {
  const { accessToken } = useAuth();
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!accessToken) return;
    const list = await apiFetch<Address[]>("/addresses", { accessToken });
    setAddresses(list);
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  async function addAddress(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiFetch("/addresses", { method: "POST", accessToken, body: { ...form, isPrimary: addresses?.length === 0 } });
      setForm(EMPTY_FORM);
      setShowForm(false);
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  async function makePrimary(addr: Address) {
    await apiFetch(`/addresses/${addr.id}`, { method: "PATCH", accessToken, body: { ...addr, isPrimary: true } });
    await load();
  }

  async function remove(id: string) {
    await apiFetch(`/addresses/${id}`, { method: "DELETE", accessToken });
    await load();
  }

  if (!addresses) return <p className="text-[13px] text-text-muted">Loading addresses…</p>;

  return (
    <div>
      <div className="flex flex-col gap-3">
        {addresses.map((addr) => (
          <div key={addr.id} className="flex items-start justify-between rounded-card border border-border bg-white p-4">
            <div className="text-[13px]">
              <p className="font-semibold text-text-dark">
                {addr.label} {addr.isPrimary && <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">Primary</span>}
              </p>
              <p className="text-text-secondary">{addr.address}</p>
              <p className="text-text-muted">
                {addr.phone}
                {addr.altPhone ? ` · ${addr.altPhone}` : ""}
              </p>
            </div>
            <div className="flex gap-3 text-[12px]">
              {!addr.isPrimary && (
                <button onClick={() => makePrimary(addr)} className="font-medium text-primary hover:underline">
                  Make Primary
                </button>
              )}
              <button onClick={() => remove(addr.id)} className="font-medium text-error hover:underline">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm ? (
        <form onSubmit={addAddress} className="mt-4 flex flex-col gap-3 rounded-card border border-border bg-white p-4">
          {[
            { key: "label" as const, label: "Label (e.g. Home)" },
            { key: "address" as const, label: "Address" },
            { key: "phone" as const, label: "Phone" },
            { key: "altPhone" as const, label: "Alternate phone (optional)" },
          ].map((f) => (
            <div key={f.key} className="flex flex-col gap-1">
              <label className="text-[12px] text-text-secondary">{f.label}</label>
              <input
                required={f.key !== "altPhone"}
                value={form[f.key]}
                onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                className="rounded-control border border-border px-3 py-2 text-[13px]"
              />
            </div>
          ))}
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="rounded-control bg-primary px-4 py-2 text-[13px] font-semibold text-white">
              {submitting ? "Saving…" : "Save Address"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-control border border-border px-4 py-2 text-[13px]">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 rounded-control border border-dashed border-border px-4 py-2 text-[13px] font-medium text-primary"
        >
          + Add Address
        </button>
      )}
    </div>
  );
}
