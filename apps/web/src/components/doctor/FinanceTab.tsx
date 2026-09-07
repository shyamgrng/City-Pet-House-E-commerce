"use client";

import { useState } from "react";
import type { VetBooking } from "@/lib/vet-types";

const RANGE_OPTIONS = ["Today", "Yesterday", "Last 7 days", "This Month", "All Time", "Custom"] as const;
type RangeKey = (typeof RANGE_OPTIONS)[number];

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

/** Returns the [start, end] epoch-ms window for the selected range, or null for "All Time"
 * (and for "Custom" with neither date filled in) meaning "don't filter by date at all". */
function computeWindow(range: RangeKey, customFrom: string, customTo: string): { start: number; end: number } | null {
  const now = new Date();
  switch (range) {
    case "Today":
      return { start: startOfDay(now).getTime(), end: endOfDay(now).getTime() };
    case "Yesterday": {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return { start: startOfDay(y).getTime(), end: endOfDay(y).getTime() };
    }
    case "Last 7 days": {
      const from = new Date(now);
      from.setDate(from.getDate() - 6);
      return { start: startOfDay(from).getTime(), end: endOfDay(now).getTime() };
    }
    case "This Month": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: startOfDay(from).getTime(), end: endOfDay(now).getTime() };
    }
    case "All Time":
      return null;
    case "Custom": {
      if (!customFrom && !customTo) return null;
      const start = customFrom ? startOfDay(new Date(customFrom)).getTime() : -Infinity;
      const end = customTo ? endOfDay(new Date(customTo)).getTime() : Infinity;
      return { start, end };
    }
  }
}

export default function FinanceTab({ bookings }: { bookings: VetBooking[] }) {
  const [range, setRange] = useState<RangeKey>("All Time");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const dateWindow = computeWindow(range, customFrom, customTo);
  const windowed = dateWindow ? bookings.filter((b) => b.createdAt >= dateWindow.start && b.createdAt <= dateWindow.end) : bookings;

  const billable = windowed.filter((b) => b.status === "Completed" || b.status === "In Progress" || b.status === "Confirmed");
  const received = billable.filter((b) => b.status === "Completed");

  const totalEarned = billable.reduce((sum, b) => sum + b.amount, 0);
  const totalReceived = received.reduce((sum, b) => sum + b.amount, 0);
  const totalReceivable = totalEarned - totalReceived;

  // One row per billable consult, oldest first, with a running balance -- reads as an actual
  // ledger (debit when earned, credit once paid out) rather than two disconnected tables.
  type LedgerRow = { booking: VetBooking; debit: number; credit: number; balance: number };
  const ledgerRows = [...billable].sort((a, b) => a.createdAt - b.createdAt);
  const ledger = ledgerRows.reduce<LedgerRow[]>((rows, b) => {
    const credit = b.status === "Completed" ? b.amount : 0;
    const previousBalance = rows.length > 0 ? rows[rows.length - 1].balance : 0;
    return [...rows, { booking: b, debit: b.amount, credit, balance: previousBalance + b.amount - credit }];
  }, []);

  const fmtDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        {RANGE_OPTIONS.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer border-0"
            style={{ background: range === r ? "#1996C8" : "#F0F2F4", color: range === r ? "#fff" : "#5B6773" }}
          >
            {r}
          </button>
        ))}
        {range === "Custom" && (
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="h-9 rounded-lg border border-[#E4E9EC] px-2.5 text-xs"
            />
            <span className="text-xs text-[#8A96A3]">to</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="h-9 rounded-lg border border-[#E4E9EC] px-2.5 text-xs"
            />
          </div>
        )}
      </div>

      <div className="flex gap-3.5 mb-6">
        <FinanceStat label="Total Earned" value={totalEarned} color="#1A2027" />
        <FinanceStat label="Total Received" value={totalReceived} color="#1F7A4D" />
        <FinanceStat label="Balance Receivable" value={totalReceivable} color="#7A56C8" />
      </div>

      <div className="flex justify-between items-baseline mb-2.5">
        <div className="text-[13px] font-bold text-[#1A2027]">Ledger</div>
        <div className="text-[11px] text-[#8A96A3]">{ledger.length} {ledger.length === 1 ? "entry" : "entries"}</div>
      </div>
      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[100px_110px_1fr_100px_110px_110px_110px] px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
              <div>Date</div>
              <div>Invoice</div>
              <div>Client · Pet</div>
              <div>Status</div>
              <div className="text-right">Earned (Dr.)</div>
              <div className="text-right">Received (Cr.)</div>
              <div className="text-right">Balance</div>
            </div>
            {ledger.length === 0 ? (
              <div className="px-4 py-6 text-xs text-[#8A96A3] text-center">No consults in this period</div>
            ) : (
              ledger.map(({ booking: b, debit, credit, balance }) => (
                <div
                  key={b.id}
                  className="grid grid-cols-[100px_110px_1fr_100px_110px_110px_110px] px-4 py-3 text-xs items-center border-b border-[#F0F2F4] last:border-0"
                >
                  <div className="text-[#5B6773]">{fmtDate(b.createdAt)}</div>
                  <div className="font-semibold text-[#1A2027]">{b.invoiceNumber}</div>
                  <div className="text-[#5B6773] truncate pr-2">
                    {b.ownerName} · {b.petName}
                  </div>
                  <div className="text-[10px] font-bold text-[#5B6773]">{b.status}</div>
                  <div className="text-right font-semibold text-[#1A2027]">Rs. {debit}</div>
                  <div className="text-right font-semibold text-[#1F7A4D]">{credit > 0 ? `Rs. ${credit}` : "—"}</div>
                  <div className="text-right font-semibold text-[#7A56C8]">Rs. {balance}</div>
                </div>
              ))
            )}
            {ledger.length > 0 && (
              <div className="grid grid-cols-[100px_110px_1fr_100px_110px_110px_110px] px-4 py-3 text-xs font-bold text-[#1A2027] bg-[#F7F9FA]">
                <div className="col-span-4">Total</div>
                <div className="text-right">Rs. {totalEarned}</div>
                <div className="text-right text-[#1F7A4D]">Rs. {totalReceived}</div>
                <div className="text-right text-[#7A56C8]">Rs. {totalReceivable}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FinanceStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex-1 border border-[#E4E9EC] rounded-xl p-4">
      <div className="text-[11px] text-[#8A96A3] mb-1.5">{label}</div>
      <div className="font-heading font-bold text-xl" style={{ color }}>
        Rs. {value}
      </div>
    </div>
  );
}
