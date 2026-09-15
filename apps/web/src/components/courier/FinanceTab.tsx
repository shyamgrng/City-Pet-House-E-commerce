"use client";

import { useState } from "react";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import type { Delivery } from "@/lib/delivery-types";

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

const fmtDMY = (ts: number) => {
  const d = new Date(ts);
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
};
const fmtAmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type VchType = "Delivery" | "Received";
type Voucher = {
  delivery: Delivery;
  date: number;
  vchType: VchType;
  debit: number;
  credit: number;
};

/** Every accepted delivery posts a "Delivery" (debit) entry the day it's dispatched to the
 * courier; a Delivered one also posts a matching "Received" (credit) entry the day payment was
 * actually collected -- two vouchers per settled delivery, exactly like the doctor's consult
 * ledger, instead of one row that tries to show both earned and received at once. */
function buildVouchers(deliveries: Delivery[]): Voucher[] {
  const vouchers: Voucher[] = [];
  for (const d of deliveries) {
    if (d.status === "Cancelled" || d.status === "Awaiting Courier") continue;
    vouchers.push({ delivery: d, date: d.dispatchedAt ?? 0, vchType: "Delivery", debit: d.amount, credit: 0 });
    if (d.status === "Delivered") {
      vouchers.push({ delivery: d, date: d.deliveredAt ?? d.dispatchedAt ?? 0, vchType: "Received", debit: 0, credit: d.amount });
    }
  }
  return vouchers.sort((a, b) => a.date - b.date || (a.vchType === "Delivery" ? -1 : 1));
}

export default function FinanceTab({ deliveries, courierName }: { deliveries: Delivery[]; courierName: string }) {
  const { settings } = useSiteSettings();
  const [range, setRange] = useState<RangeKey>("All Time");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const dateWindow = computeWindow(range, customFrom, customTo);
  const allVouchers = buildVouchers(deliveries);

  // Opening balance carries forward everything before the window -- a "receivable" balance
  // doesn't reset just because you're only looking at today; it's what's actually owed as of
  // the start of the period.
  const openingBalance = dateWindow
    ? allVouchers.filter((v) => v.date < dateWindow.start).reduce((sum, v) => sum + v.debit - v.credit, 0)
    : 0;
  const periodVouchers = dateWindow ? allVouchers.filter((v) => v.date >= dateWindow.start && v.date <= dateWindow.end) : allVouchers;

  type LedgerRow = Voucher & { balance: number };
  const ledger = periodVouchers.reduce<LedgerRow[]>((rows, v) => {
    const previousBalance = rows.length > 0 ? rows[rows.length - 1].balance : openingBalance;
    return [...rows, { ...v, balance: previousBalance + v.debit - v.credit }];
  }, []);

  const periodDebit = periodVouchers.reduce((sum, v) => sum + v.debit, 0);
  const periodCredit = periodVouchers.reduce((sum, v) => sum + v.credit, 0);
  const closingBalance = ledger.length > 0 ? ledger[ledger.length - 1].balance : openingBalance;
  const deliveryCount = periodVouchers.filter((v) => v.vchType === "Delivery").length;
  const receivedCount = periodVouchers.filter((v) => v.vchType === "Received").length;

  const periodLabel = dateWindow
    ? `${fmtDMY(dateWindow.start)} To ${fmtDMY(dateWindow.end)}`
    : allVouchers.length > 0
      ? `${fmtDMY(allVouchers[0].date)} To ${fmtDMY(allVouchers[allVouchers.length - 1].date)}`
      : "All Time";

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
        <FinanceStat label="Total Earned" value={periodDebit} color="#1A2027" />
        <FinanceStat label="Total Received" value={periodCredit} color="#1F7A4D" />
        <FinanceStat label="Balance Receivable" value={closingBalance} color="#7A56C8" />
      </div>

      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <div className="text-[15px] font-bold text-primary">{settings.businessName.toUpperCase()}</div>
          <div className="text-[13px] font-bold text-[#1A2027] mt-1">{courierName} A/C</div>
          <div className="text-[13px] font-bold text-[#1A2027]">Delivery Fees — Receivable</div>
          <div className="text-[13px] font-bold text-[#1A2027]">{periodLabel}</div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[820px]">
            <div className="grid grid-cols-[100px_1fr_90px_120px_100px_110px_110px_110px] bg-[#5B6773] text-white text-[11px] font-bold uppercase px-5 py-2.5">
              <div>Date</div>
              <div>Particulars</div>
              <div>Vch Type</div>
              <div>Vch No.</div>
              <div>Ref No.</div>
              <div className="text-right">Debit</div>
              <div className="text-right">Credit</div>
              <div className="text-right">Balance</div>
            </div>

            <div className="grid grid-cols-[100px_1fr_90px_120px_100px_110px_110px_110px] px-5 py-2.5 text-xs items-center border-b border-[#F0F2F4]">
              <div className="col-span-4 font-bold text-[#1A2027]">Opening Balance:</div>
              <div />
              <div />
              <div className="text-right font-bold text-[#7A56C8]">NPR {fmtAmt(openingBalance)}</div>
            </div>

            {ledger.length === 0 ? (
              <div className="px-5 py-6 text-xs text-[#8A96A3] text-center">No transactions in this period</div>
            ) : (
              ledger.map((row, i) => (
                <div key={`${row.delivery.id}-${row.vchType}-${i}`} className="border-b border-[#F0F2F4] last:border-0">
                  <div className="grid grid-cols-[100px_1fr_90px_120px_100px_110px_110px_110px] px-5 py-2.5 text-xs items-center">
                    <div className="text-[#5B6773]">{fmtDMY(row.date)}</div>
                    <div className="font-semibold text-[#1A2027] truncate pr-2">{row.delivery.client}</div>
                    <div className="text-[#5B6773]">{row.vchType}</div>
                    <div className="font-semibold text-primary truncate">{row.delivery.id}</div>
                    <div className="text-[#8A96A3]">—</div>
                    <div className="text-right font-semibold text-[#1A2027]">{row.debit > 0 ? fmtAmt(row.debit) : ""}</div>
                    <div className="text-right font-semibold text-[#1F7A4D]">{row.credit > 0 ? fmtAmt(row.credit) : ""}</div>
                    <div className="text-right font-semibold text-[#7A56C8]">{fmtAmt(row.balance)}</div>
                  </div>
                  <div className="px-5 pb-2 text-[11px] text-[#8A96A3]">Narration: {row.delivery.address}</div>
                </div>
              ))
            )}

            <div className="grid grid-cols-[100px_1fr_90px_120px_100px_110px_110px_110px] px-5 py-2.5 text-xs font-bold text-[#1A2027] bg-[#F7F9FA]">
              <div className="col-span-4">Current Total:</div>
              <div className="text-right">NPR {fmtAmt(periodDebit)}</div>
              <div className="text-right text-[#1F7A4D]">NPR {fmtAmt(periodCredit)}</div>
              <div />
            </div>
            <div className="grid grid-cols-[100px_1fr_90px_120px_100px_110px_110px_110px] px-5 py-2.5 text-xs font-bold text-[#1A2027] border-t border-[#E4E9EC]">
              <div className="col-span-4">Closing Balance:</div>
              <div />
              <div />
              <div className="text-right text-[#7A56C8]">NPR {fmtAmt(closingBalance)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden max-w-[320px]">
        <VoucherCountRow label="Delivery" count={deliveryCount} />
        <VoucherCountRow label="Received" count={receivedCount} />
        <div className="flex justify-between items-center px-4 py-2.5 text-xs font-bold text-white bg-[#5B6773]">
          <div>Total Transactions</div>
          <div>{deliveryCount + receivedCount}</div>
        </div>
      </div>
    </div>
  );
}

function VoucherCountRow({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex justify-between items-center px-4 py-2 text-xs border-b border-[#F0F2F4] last:border-0">
      <div className="text-[#3A4652]">{label}</div>
      <div className="font-semibold text-[#1A2027]">{count}</div>
    </div>
  );
}

function FinanceStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex-1 border border-[#E4E9EC] rounded-xl p-4">
      <div className="text-[11px] text-[#8A96A3] mb-1.5">{label}</div>
      <div className="font-heading font-bold text-xl" style={{ color }}>
        Rs. {value.toLocaleString("en-IN")}
      </div>
    </div>
  );
}
