"use client";

import type { B2BProductSubmission } from "@/lib/b2b-types";
import { netPayout } from "@/lib/b2b-types";

export default function FinanceTab({ submissions }: { submissions: B2BProductSubmission[] }) {
  const approved = submissions.filter((s) => s.status === "Approved");
  const grossValue = approved.reduce((sum, s) => sum + s.price * s.qty, 0);
  const totalCommission = approved.reduce((sum, s) => sum + Math.round((s.price * s.qty * s.commissionPct) / 100), 0);
  const netPayable = grossValue - totalCommission;

  const fmt = (n: number) => "Rs. " + n.toLocaleString("en-IN");
  const fmtDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div>
      <div className="flex gap-3.5 mb-5 flex-wrap">
        <FinanceStat label="Gross Stock Value" value={fmt(grossValue)} color="#1A2027" />
        <FinanceStat label="Commission Deducted" value={fmt(totalCommission)} color="#D64545" />
        <FinanceStat label="Net Payable" value={fmt(netPayable)} color="#1F7A4D" />
      </div>

      <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Approved Products — Payout Breakdown</div>
      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
        <div className="grid grid-cols-5 px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
          <div>Product</div>
          <div>Approved On</div>
          <div>Value</div>
          <div>Commission</div>
          <div>Net Payout</div>
        </div>
        {approved.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">No approved products yet — payouts will appear here once City Pet House approves a submission</div>
        ) : (
          approved.map((s) => (
            <div key={s.id} className="grid grid-cols-5 px-4 py-3 text-xs items-center border-b border-[#F0F2F4] last:border-0">
              <div className="font-semibold text-[#1A2027]">{s.name}</div>
              <div className="text-[#5B6773]">{fmtDate(s.submittedAt)}</div>
              <div className="text-[#5B6773]">{fmt(s.price * s.qty)}</div>
              <div className="text-[#D64545]">{s.commissionPct}%</div>
              <div className="font-semibold text-[#1F7A4D]">{fmt(netPayout(s))}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function FinanceStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex-1 min-w-[160px] border border-[#E4E9EC] rounded-xl p-4">
      <div className="text-[11px] text-[#8A96A3] mb-1.5">{label}</div>
      <div className="font-heading font-bold text-lg" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
