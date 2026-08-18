"use client";

import { useCallback, useEffect, useState } from "react";
import { formatNPR } from "@cph/shared-types";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { apiFetch, ApiError } from "@/lib/api";

interface Doctor {
  id: string;
  email: string;
  status: string;
  displayName: string;
  qualification: string | null;
  licenseNo: string | null;
  address: string | null;
  consultFee: number;
  isOnline: boolean;
  verified: boolean;
}

const EMPTY_FORM = {
  displayName: "",
  email: "",
  password: "",
  qualification: "",
  licenseNo: "",
  address: "",
  consultFee: "",
};

export default function AdminDoctorsPage() {
  const { accessToken } = useAdminAuth();
  const [doctors, setDoctors] = useState<Doctor[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setDoctors(await apiFetch<Doctor[]>("/admin/doctors", { accessToken }));
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  function startAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function startEdit(d: Doctor) {
    setEditingId(d.id);
    setForm({
      displayName: d.displayName,
      email: d.email,
      password: "",
      qualification: d.qualification ?? "",
      licenseNo: d.licenseNo ?? "",
      address: d.address ?? "",
      consultFee: String(d.consultFee),
    });
    setShowForm(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (editingId) {
        await apiFetch(`/admin/doctors/${editingId}`, {
          method: "PATCH",
          accessToken,
          body: {
            displayName: form.displayName,
            qualification: form.qualification.trim() || undefined,
            licenseNo: form.licenseNo.trim() || undefined,
            address: form.address.trim() || undefined,
            consultFee: Number(form.consultFee),
          },
        });
      } else {
        await apiFetch("/admin/doctors", {
          method: "POST",
          accessToken,
          body: {
            displayName: form.displayName,
            email: form.email,
            password: form.password,
            qualification: form.qualification.trim() || undefined,
            licenseNo: form.licenseNo.trim() || undefined,
            address: form.address.trim() || undefined,
            consultFee: Number(form.consultFee),
          },
        });
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save the doctor account.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleVerified(d: Doctor) {
    await apiFetch(`/admin/doctors/${d.id}`, { method: "PATCH", accessToken, body: { verified: !d.verified } });
    await load();
  }

  async function toggleStatus(d: Doctor) {
    await apiFetch(`/admin/doctors/${d.id}`, {
      method: "PATCH",
      accessToken,
      body: { status: d.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" },
    });
    await load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[22px]">Doctors</h1>
        <button onClick={startAdd} className="rounded-control bg-primary px-4 py-2 text-[13px] font-semibold text-white">
          + Add Doctor
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="mb-6 grid grid-cols-2 gap-3 rounded-card border border-border bg-white p-5">
          <div className="flex flex-col gap-1">
            <label htmlFor="doc-name" className="text-[12px] text-text-secondary">Display Name</label>
            <input
              id="doc-name"
              required
              value={form.displayName}
              onChange={(e) => setForm((s) => ({ ...s, displayName: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="doc-email" className="text-[12px] text-text-secondary">Email</label>
            <input
              id="doc-email"
              type="email"
              required
              disabled={!!editingId}
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px] disabled:bg-bg-surface disabled:text-text-muted"
            />
          </div>

          {!editingId && (
            <div className="flex flex-col gap-1">
              <label htmlFor="doc-password" className="text-[12px] text-text-secondary">Temporary Password</label>
              <input
                id="doc-password"
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                className="rounded-control border border-border px-3 py-2 text-[13px]"
              />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label htmlFor="doc-fee" className="text-[12px] text-text-secondary">Consult Fee (Rs.)</label>
            <input
              id="doc-fee"
              type="number"
              min={0}
              required
              value={form.consultFee}
              onChange={(e) => setForm((s) => ({ ...s, consultFee: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="doc-qualification" className="text-[12px] text-text-secondary">Qualification</label>
            <input
              id="doc-qualification"
              placeholder="e.g. BVSc & AH, Tribhuvan University"
              value={form.qualification}
              onChange={(e) => setForm((s) => ({ ...s, qualification: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="doc-license" className="text-[12px] text-text-secondary">NVC License No.</label>
            <input
              id="doc-license"
              placeholder="e.g. NVC-2014-0412"
              value={form.licenseNo}
              onChange={(e) => setForm((s) => ({ ...s, licenseNo: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1">
            <label htmlFor="doc-address" className="text-[12px] text-text-secondary">Address (optional)</label>
            <input
              id="doc-address"
              value={form.address}
              onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>

          {error && <p className="col-span-2 text-[12px] text-error">{error}</p>}
          <div className="col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-control bg-primary px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "Saving…" : editingId ? "Save Changes" : "Add Doctor"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-control border border-border px-4 py-2 text-[13px]">
              Cancel
            </button>
          </div>
        </form>
      )}

      {!doctors ? (
        <p className="text-[13px] text-text-muted">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-white">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-bg-surface text-left text-[12px] text-text-muted">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Fee</th>
                <th className="px-4 py-3">Live Status</th>
                <th className="px-4 py-3">Verified</th>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((d) => (
                <tr key={d.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-text-dark">{d.displayName}</td>
                  <td className="px-4 py-3 text-text-secondary">{d.email}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatNPR(d.consultFee)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${d.isOnline ? "bg-success/10 text-success" : "bg-text-muted/10 text-text-muted"}`}>
                      {d.isOnline ? "Online" : "Offline"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleVerified(d)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${d.verified ? "bg-primary/10 text-primary" : "bg-[#F59E0B]/10 text-[#F59E0B]"}`}
                    >
                      {d.verified ? "Verified" : "Unverified"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(d)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${d.status === "ACTIVE" ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}
                    >
                      {d.status === "ACTIVE" ? "Active" : "Suspended"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => startEdit(d)} className="text-[12px] font-medium text-primary hover:underline">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
