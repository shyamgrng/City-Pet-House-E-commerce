"use client";

import type { Delivery } from "@/lib/delivery-types";

export default function EarningsTab({ deliveries }: { deliveries: Delivery[] }) {
  const active = deliveries.filter((d) => d.status !== "Delivered" && d.status !== "Cancelled");
  const delivered = deliveries.filter((d) => d.status === "Delivered");

  const totalReceivable = deliveries.filter((d) => d.status !== "Cancelled").reduce((sum, d) => sum + d.amount, 0);
  const totalDelivered = delivered.reduce((sum, d) => sum + d.amount, 0);
  const totalPending = active.reduce((sum, d) => sum + d.amount, 0);

  const fmt = (n: number) => "Rs. " + n.toLocaleString("en-IN");
  const fmtDate = (ts?: number) => (ts ? new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—");

  return (
    <div>
      <div className="flex gap-3.5 mb-5 flex-wrap">
        <Stat label="Total Order Value" value={fmt(totalReceivable)} color="#7A56C8" />
        <Stat label="Delivered" value={fmt(totalDelivered)} color="#1F7A4D" />
        <Stat label="In Progress" value={fmt(totalPending)} color="#D64545" />
      </div>

      <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Delivered Orders</div>
      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
        <div className="grid grid-cols-3 px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
          <div>Order</div>
          <div>Delivered On</div>
          <div>Amount</div>
        </div>
        {delivered.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">No delivered orders yet</div>
        ) : (
          delivered.map((d) => (
            <div key={d.id} className="grid grid-cols-3 px-4 py-3 text-xs items-center border-b border-[#F0F2F4] last:border-0">
              <div className="font-semibold text-[#1A2027]">{d.id}</div>
              <div className="text-[#5B6773]">{fmtDate(d.deliveredAt)}</div>
              <div className="font-semibold text-[#1F7A4D]">{fmt(d.amount)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex-1 min-w-[160px] border border-[#E4E9EC] rounded-xl p-4">
      <div className="text-[11px] text-[#8A96A3] mb-1.5">{label}</div>
      <div className="font-heading font-bold text-lg" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
