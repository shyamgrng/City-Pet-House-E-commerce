"use client";

import { useState } from "react";
import { useCourierAuth } from "@/context/CourierAuthContext";
import { financeFlows, financeOverview } from "@/lib/admin-data";

const subTabs = ["Overview", "Income", "Refunds", "Cancellations", "Receivable", "Payable", "Accounts", "Audit Log"];
const ranges = ["Today", "Yesterday", "Last 7 days", "All time"];

function courierPayable(c: { defaultFlatPrice: number; priceMedium: number }) {
  return c.defaultFlatPrice || c.priceMedium || 0;
}

export default function FinancePage() {
  const [tab, setTab] = useState("Overview");
  const [range, setRange] = useState("All time");
  const { accounts: couriers } = useCourierAuth();
  const courierPayableTotal = couriers.reduce((sum, c) => sum + courierPayable(c), 0);

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {subTabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
            style={{ background: tab === t ? "#1996C8" : "#fff", color: tab === t ? "#fff" : "#3A4652", border: tab === t ? "none" : "1px solid #E4E9EC" }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex gap-3 mb-5 flex-wrap items-center">
        <input
          placeholder="Search party, description, order/booking ID…"
          className="flex-1 min-w-[240px] border border-[#E4E9EC] rounded-lg px-3.5 py-2.5 text-[13px]"
        />
        {ranges.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer"
            style={{ background: range === r ? "#1996C8" : "#F0F2F4", color: range === r ? "#fff" : "#5B6773" }}
          >
            {r}
          </button>
        ))}
      </div>

      {tab === "Payable" && (
        <>
          <div className="font-heading font-bold text-base text-[#1A2027] mb-1">Accounts Payable</div>
          <div className="text-xs text-[#5B6773] mb-4">Estimated per-delivery fee owed to each courier supplier.</div>
          <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden mb-4">
            <div className="grid grid-cols-3 px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
              <div>Party</div>
              <div>Type</div>
              <div>Amount</div>
            </div>
            {couriers.length === 0 ? (
              <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">No courier suppliers yet</div>
            ) : (
              couriers.map((c) => (
                <div key={c.courierId} className="grid grid-cols-3 px-4 py-3 text-xs items-center border-b border-[#F0F2F4] last:border-0">
                  <div className="font-semibold text-[#1A2027]">{c.companyName}</div>
                  <div className="text-[10px] font-bold text-[#B8860B] bg-[#FFF6E5] rounded-full px-2 py-0.5 w-fit">Courier Fees</div>
                  <div className="font-semibold text-[#7A56C8]">Rs. {courierPayable(c).toLocaleString("en-IN")}</div>
                </div>
              ))
            )}
          </div>
          <Stat label="Total Payable" value={"Rs. " + courierPayableTotal.toLocaleString("en-IN")} color="#7A56C8" />
        </>
      )}

      {tab !== "Overview" && tab !== "Payable" && (
        <div className="bg-white border border-dashed border-[#E4E9EC] rounded-[10px] p-8 text-center text-xs text-[#8A96A3]">
          {tab} — coming soon
        </div>
      )}

      {tab === "Overview" && (
        <>
          <div className="font-heading font-bold text-base text-[#1A2027] mb-4">Finance Overview</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-3.5">
            <Stat label="Total Income" value={financeOverview.totalIncome} color="#1F7A4D" />
            <Stat label="Total Refunds" value={financeOverview.totalRefunds} color="#D64545" />
            <Stat label="Cancelled" value={financeOverview.cancelled} color="#8A96A3" />
            <Stat label="Net Revenue" value={financeOverview.netRevenue} color="#1A2027" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
            <Stat label="Accounts Receivable" value={financeOverview.receivable} color="#C9962B" />
            <Stat label="Accounts Payable" value={"Rs. " + courierPayableTotal.toLocaleString("en-IN")} color="#7A56C8" />
            <Stat label="Potential Stock Profit" value={financeOverview.potentialProfit} color="#17A2A0" />
          </div>

          <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-5">
            <div className="text-[13px] font-bold text-[#1A2027] mb-4">Income vs. Outflows</div>
            {financeFlows.map((f) => (
              <div key={f.label} className="mb-4 last:mb-0">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-bold text-[#1A2027]">{f.label}</span>
                  <span className="text-[#5B6773]">{f.amount}</span>
                </div>
                <div className="h-1.5 bg-[#EEF1F3] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${f.pct}%`, background: f.color }} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-4">
      <div className="text-[11px] text-[#8A96A3] font-semibold mb-2">{label}</div>
      <div className="font-heading font-bold text-xl" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
