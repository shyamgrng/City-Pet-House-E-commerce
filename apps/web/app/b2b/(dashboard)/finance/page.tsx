"use client";

import { useCallback, useEffect, useState } from "react";
import { formatNPR } from "@cph/shared-types";
import { useB2BAuth } from "@/context/B2BAuthContext";
import { apiFetch } from "@/lib/api";

interface LedgerEntry {
  id: string;
  orderItemId: string;
  saleAmount: number;
  commissionPct: number;
  payableAmount: number;
  paidStatus: string;
  paidAt: string | null;
  createdAt: string;
}

export default function B2BFinancePage() {
  const { accessToken } = useB2BAuth();
  const [entries, setEntries] = useState<LedgerEntry[] | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setEntries(await apiFetch<LedgerEntry[]>("/b2b/finance", { accessToken }));
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPayable = entries?.reduce((sum, e) => sum + (e.paidStatus === "UNPAID" ? e.payableAmount : 0), 0) ?? 0;

  return (
    <div>
      <h1 className="mb-2 text-[22px]">Finance</h1>
      <p className="mb-6 text-[13px] text-text-secondary">
        Outstanding payable: <span className="font-semibold text-text-dark">{formatNPR(totalPayable)}</span>
      </p>

      {!entries ? (
        <p className="text-[13px] text-text-muted">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-[13px] text-text-muted">No ledger entries yet — these are created once your orders are fulfilled.</p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-white">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-bg-surface text-left text-[12px] text-text-muted">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Sale Amount</th>
                <th className="px-4 py-3">Commission</th>
                <th className="px-4 py-3">Payable</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-text-secondary">{new Date(e.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatNPR(e.saleAmount)}</td>
                  <td className="px-4 py-3 text-text-secondary">{e.commissionPct}%</td>
                  <td className="px-4 py-3 font-medium text-text-dark">{formatNPR(e.payableAmount)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        e.paidStatus === "PAID" ? "bg-success/10 text-success" : "bg-[#F59E0B]/10 text-[#F59E0B]"
                      }`}
                    >
                      {e.paidStatus === "PAID" ? "Paid" : "Unpaid"}
                    </span>
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
