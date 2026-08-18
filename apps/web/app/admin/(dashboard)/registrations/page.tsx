"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { apiFetch, ApiError } from "@/lib/api";

interface Supplier {
  id: string;
  email: string;
  status: string;
  companyName: string;
  contactName: string;
  phone: string | null;
  altPhone: string | null;
  address: string | null;
  categories: string[];
  commissionPct: number;
  verified: boolean;
}

export default function AdminRegistrationsPage() {
  const { accessToken } = useAdminAuth();
  const [suppliers, setSuppliers] = useState<Supplier[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [commissionDrafts, setCommissionDrafts] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!accessToken) return;
    const all = await apiFetch<Supplier[]>("/admin/b2b-suppliers", { accessToken });
    setSuppliers(all);
    setCommissionDrafts(Object.fromEntries(all.map((s) => [s.id, String(s.commissionPct)])));
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  async function update(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    setError(null);
    try {
      await apiFetch(`/admin/b2b-suppliers/${id}`, { method: "PATCH", accessToken, body });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That action failed.");
    } finally {
      setBusyId(null);
    }
  }

  const approve = (id: string) => update(id, { verified: true, status: "ACTIVE" });
  const reject = (id: string) => {
    if (!window.confirm("Reject this registration? The account will be suspended.")) return;
    return update(id, { status: "SUSPENDED" });
  };
  const toggleStatus = (s: Supplier) => update(s.id, { status: s.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" });
  const saveCommission = (id: string) => update(id, { commissionPct: Number(commissionDrafts[id]) });

  const pending = suppliers?.filter((s) => s.status === "PENDING_VERIFICATION") ?? [];
  const others = suppliers?.filter((s) => s.status !== "PENDING_VERIFICATION") ?? [];

  return (
    <div>
      <h1 className="mb-6 text-[22px]">Pending Registrations</h1>
      {error && <p className="mb-4 text-[13px] text-error">{error}</p>}

      {!suppliers ? (
        <p className="text-[13px] text-text-muted">Loading…</p>
      ) : (
        <>
          <section className="mb-8">
            <h2 className="mb-3 text-[14px] font-semibold text-text-dark">Awaiting Approval ({pending.length})</h2>
            {pending.length === 0 ? (
              <p className="text-[13px] text-text-muted">No pending B2B supplier registrations.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {pending.map((s) => (
                  <div key={s.id} className="rounded-card border border-[#F59E0B]/30 bg-[#F59E0B]/5 p-5">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[14px] font-semibold text-text-dark">{s.companyName}</span>
                      <span className="rounded-full bg-[#F59E0B]/10 px-2.5 py-1 text-[11px] font-semibold text-[#F59E0B]">Pending</span>
                    </div>
                    <p className="mb-1 text-[12px] text-text-secondary">Contact: {s.contactName} &middot; {s.email} &middot; {s.phone}</p>
                    {s.address && <p className="mb-1 text-[12px] text-text-secondary">{s.address}</p>}
                    {s.categories.length > 0 && (
                      <p className="mb-3 text-[12px] text-text-muted">Categories: {s.categories.join(", ")}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => approve(s.id)}
                        disabled={busyId === s.id}
                        className="rounded-control bg-primary px-4 py-2 text-[12px] font-semibold text-white disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => reject(s.id)}
                        disabled={busyId === s.id}
                        className="rounded-control border border-error px-4 py-2 text-[12px] font-medium text-error disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-[14px] font-semibold text-text-dark">All B2B Suppliers</h2>
            {others.length === 0 ? (
              <p className="text-[13px] text-text-muted">No approved or suspended suppliers yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-card border border-border bg-white">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-border bg-bg-surface text-left text-[12px] text-text-muted">
                      <th className="px-4 py-3">Company</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3">Commission %</th>
                      <th className="px-4 py-3">Account</th>
                    </tr>
                  </thead>
                  <tbody>
                    {others.map((s) => (
                      <tr key={s.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 font-medium text-text-dark">{s.companyName}</td>
                        <td className="px-4 py-3 text-text-secondary">
                          {s.contactName}
                          <br />
                          <span className="text-text-muted">{s.email}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={commissionDrafts[s.id] ?? ""}
                              onChange={(e) => setCommissionDrafts((d) => ({ ...d, [s.id]: e.target.value }))}
                              className="w-16 rounded-control border border-border px-2 py-1 text-[12px]"
                            />
                            <button
                              onClick={() => saveCommission(s.id)}
                              disabled={busyId === s.id || Number(commissionDrafts[s.id]) === s.commissionPct}
                              className="text-[12px] font-medium text-primary hover:underline disabled:opacity-40"
                            >
                              Save
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleStatus(s)}
                            disabled={busyId === s.id}
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              s.status === "ACTIVE" ? "bg-success/10 text-success" : "bg-error/10 text-error"
                            }`}
                          >
                            {s.status === "ACTIVE" ? "Active" : "Suspended"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
