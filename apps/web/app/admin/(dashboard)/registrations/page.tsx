"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { apiFetch, ApiError } from "@/lib/api";

type Kind = "B2B Supplier" | "Courier";

interface PartnerAccount {
  id: string;
  kind: Kind;
  email: string;
  status: string;
  companyName: string;
  contactName: string;
  phone: string | null;
  address: string | null;
  categories?: string[];
  commissionPct?: number;
  verified: boolean;
}

interface RawSupplier {
  id: string;
  email: string;
  status: string;
  companyName: string;
  contactName: string;
  phone: string | null;
  address: string | null;
  categories: string[];
  commissionPct: number;
  verified: boolean;
}

interface RawCourier {
  id: string;
  email: string;
  status: string;
  companyName: string;
  contactName: string;
  phone: string | null;
  address: string | null;
  verified: boolean;
}

function endpointFor(kind: Kind) {
  return kind === "B2B Supplier" ? "/admin/b2b-suppliers" : "/admin/couriers";
}

export default function AdminRegistrationsPage() {
  const { accessToken } = useAdminAuth();
  const [partners, setPartners] = useState<PartnerAccount[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [commissionDrafts, setCommissionDrafts] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!accessToken) return;
    const [suppliers, couriers] = await Promise.all([
      apiFetch<RawSupplier[]>("/admin/b2b-suppliers", { accessToken }),
      apiFetch<RawCourier[]>("/admin/couriers", { accessToken }),
    ]);
    const all: PartnerAccount[] = [
      ...suppliers.map((s) => ({ ...s, kind: "B2B Supplier" as const })),
      ...couriers.map((c) => ({ ...c, kind: "Courier" as const })),
    ];
    setPartners(all);
    setCommissionDrafts(
      Object.fromEntries(all.filter((p) => p.kind === "B2B Supplier").map((p) => [p.id, String(p.commissionPct)])),
    );
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  async function update(kind: Kind, id: string, body: Record<string, unknown>) {
    setBusyId(id);
    setError(null);
    try {
      await apiFetch(`${endpointFor(kind)}/${id}`, { method: "PATCH", accessToken, body });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That action failed.");
    } finally {
      setBusyId(null);
    }
  }

  const approve = (p: PartnerAccount) => update(p.kind, p.id, { verified: true, status: "ACTIVE" });
  const reject = (p: PartnerAccount) => {
    if (!window.confirm("Reject this registration? The account will be suspended.")) return;
    return update(p.kind, p.id, { status: "SUSPENDED" });
  };
  const toggleStatus = (p: PartnerAccount) => update(p.kind, p.id, { status: p.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" });
  const saveCommission = (p: PartnerAccount) => update(p.kind, p.id, { commissionPct: Number(commissionDrafts[p.id]) });

  const pending = partners?.filter((p) => p.status === "PENDING_VERIFICATION") ?? [];
  const others = partners?.filter((p) => p.status !== "PENDING_VERIFICATION") ?? [];

  return (
    <div>
      <h1 className="mb-6 text-[22px]">Pending Registrations</h1>
      {error && <p className="mb-4 text-[13px] text-error">{error}</p>}

      {!partners ? (
        <p className="text-[13px] text-text-muted">Loading…</p>
      ) : (
        <>
          <section className="mb-8">
            <h2 className="mb-3 text-[14px] font-semibold text-text-dark">Awaiting Approval ({pending.length})</h2>
            {pending.length === 0 ? (
              <p className="text-[13px] text-text-muted">No pending B2B or courier registrations.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {pending.map((p) => (
                  <div key={`${p.kind}-${p.id}`} className="rounded-card border border-[#F59E0B]/30 bg-[#F59E0B]/5 p-5">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[14px] font-semibold text-text-dark">{p.companyName}</span>
                      <div className="flex gap-2">
                        <span className="rounded-full bg-text-muted/10 px-2.5 py-1 text-[11px] font-semibold text-text-secondary">{p.kind}</span>
                        <span className="rounded-full bg-[#F59E0B]/10 px-2.5 py-1 text-[11px] font-semibold text-[#F59E0B]">Pending</span>
                      </div>
                    </div>
                    <p className="mb-1 text-[12px] text-text-secondary">Contact: {p.contactName} &middot; {p.email} &middot; {p.phone}</p>
                    {p.address && <p className="mb-1 text-[12px] text-text-secondary">{p.address}</p>}
                    {p.categories && p.categories.length > 0 && (
                      <p className="mb-3 text-[12px] text-text-muted">Categories: {p.categories.join(", ")}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => approve(p)}
                        disabled={busyId === p.id}
                        className="rounded-control bg-primary px-4 py-2 text-[12px] font-semibold text-white disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => reject(p)}
                        disabled={busyId === p.id}
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
            <h2 className="mb-3 text-[14px] font-semibold text-text-dark">All B2B Suppliers &amp; Couriers</h2>
            {others.length === 0 ? (
              <p className="text-[13px] text-text-muted">No approved or suspended partners yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-card border border-border bg-white">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-border bg-bg-surface text-left text-[12px] text-text-muted">
                      <th className="px-4 py-3">Company</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3">Commission %</th>
                      <th className="px-4 py-3">Account</th>
                    </tr>
                  </thead>
                  <tbody>
                    {others.map((p) => (
                      <tr key={`${p.kind}-${p.id}`} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 font-medium text-text-dark">{p.companyName}</td>
                        <td className="px-4 py-3 text-text-secondary">{p.kind}</td>
                        <td className="px-4 py-3 text-text-secondary">
                          {p.contactName}
                          <br />
                          <span className="text-text-muted">{p.email}</span>
                        </td>
                        <td className="px-4 py-3">
                          {p.kind === "B2B Supplier" ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={commissionDrafts[p.id] ?? ""}
                                onChange={(e) => setCommissionDrafts((d) => ({ ...d, [p.id]: e.target.value }))}
                                className="w-16 rounded-control border border-border px-2 py-1 text-[12px]"
                              />
                              <button
                                onClick={() => saveCommission(p)}
                                disabled={busyId === p.id || Number(commissionDrafts[p.id]) === p.commissionPct}
                                className="text-[12px] font-medium text-primary hover:underline disabled:opacity-40"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <span className="text-text-muted">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleStatus(p)}
                            disabled={busyId === p.id}
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              p.status === "ACTIVE" ? "bg-success/10 text-success" : "bg-error/10 text-error"
                            }`}
                          >
                            {p.status === "ACTIVE" ? "Active" : "Suspended"}
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
