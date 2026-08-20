"use client";

import type { VetBooking } from "@/lib/vet-types";

export default function FinanceTab({ bookings }: { bookings: VetBooking[] }) {
  const billable = bookings.filter((b) => b.status === "Completed" || b.status === "In Progress" || b.status === "Confirmed");
  const received = bookings.filter((b) => b.status === "Completed");

  const totalEarned = billable.reduce((sum, b) => sum + b.amount, 0);
  const totalReceived = received.reduce((sum, b) => sum + b.amount, 0);
  const totalReceivable = totalEarned - totalReceived;

  const fmtDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div>
      <div className="flex gap-3.5 mb-5">
        <FinanceStat label="Total Earned" value={totalEarned} color="#1A2027" />
        <FinanceStat label="Total Received" value={totalReceived} color="#1F7A4D" />
        <FinanceStat label="Balance Receivable" value={totalReceivable} color="#7A56C8" />
      </div>

      <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Total Earned — Invoices</div>
      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden mb-6">
        <div className="grid grid-cols-4 px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
          <div>Invoice Number</div>
          <div>Client</div>
          <div>Date</div>
          <div>Amount Earned</div>
        </div>
        {billable.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">No invoices yet</div>
        ) : (
          billable.map((b) => (
            <div key={b.id} className="grid grid-cols-4 px-4 py-3 text-xs items-center border-b border-[#F0F2F4] last:border-0">
              <div className="font-semibold text-[#1A2027]">{b.invoiceNumber}</div>
              <div className="text-[#5B6773]">{b.ownerName}</div>
              <div className="text-[#5B6773]">{fmtDate(b.createdAt)}</div>
              <div className="font-semibold text-[#7A56C8]">Rs. {b.amount}</div>
            </div>
          ))
        )}
        <div className="grid grid-cols-4 px-4 py-3 text-xs font-bold text-[#1A2027] bg-[#F7F9FA]">
          <div>Total Earned</div>
          <div />
          <div />
          <div className="text-[#7A56C8]">Rs. {totalEarned}</div>
        </div>
      </div>

      <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Total Received — Payment Slips</div>
      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
        <div className="grid grid-cols-3 px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
          <div>Payment Slip No.</div>
          <div>Date Deposited</div>
          <div>Amount</div>
        </div>
        {received.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">No payments deposited yet</div>
        ) : (
          received.map((b) => (
            <div key={b.id} className="grid grid-cols-3 px-4 py-3 text-xs items-center border-b border-[#F0F2F4] last:border-0">
              <div className="font-semibold text-[#1A2027]">{b.invoiceNumber}</div>
              <div className="text-[#5B6773]">{fmtDate(b.createdAt)}</div>
              <div className="font-semibold text-[#1F7A4D]">Rs. {b.amount}</div>
            </div>
          ))
        )}
        <div className="grid grid-cols-3 px-4 py-3 text-xs font-bold text-[#1A2027] bg-[#F7F9FA]">
          <div>Total Received</div>
          <div />
          <div className="text-[#1F7A4D]">Rs. {totalReceived}</div>
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
