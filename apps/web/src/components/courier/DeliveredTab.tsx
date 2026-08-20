"use client";

import { useState } from "react";
import type { Delivery } from "@/lib/delivery-types";
import { STATUS_COLORS } from "@/lib/delivery-types";

export default function DeliveredTab({ deliveries }: { deliveries: Delivery[] }) {
  const [selected, setSelected] = useState<Delivery | null>(null);
  const fmtDate = (ts?: number) => (ts ? new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—");

  if (selected) {
    return (
      <div>
        <div onClick={() => setSelected(null)} className="text-xs text-primary font-semibold cursor-pointer mb-4">
          ← Back to List
        </div>
        <div className="border border-[#E4E9EC] rounded-xl p-5 max-w-[520px]">
          <div className="text-[15px] font-bold text-[#1A2027] mb-1">
            {selected.id} — {selected.client}
          </div>
          <div className="text-[13px] font-bold mb-4" style={{ color: STATUS_COLORS[selected.status] }}>
            {selected.status}
          </div>
          <div className="grid grid-cols-2 gap-3.5 text-xs mb-4">
            <div>
              <div className="text-[#8A96A3] mb-0.5">Amount</div>
              <div className="font-semibold text-[#1A2027]">Rs. {selected.amount.toLocaleString("en-IN")}</div>
            </div>
            <div>
              <div className="text-[#8A96A3] mb-0.5">{selected.status === "Cancelled" ? "Cancelled" : "Delivered"}</div>
              <div className="font-semibold text-[#1A2027]">{fmtDate(selected.deliveredAt)}</div>
            </div>
            <div className="col-span-2">
              <div className="text-[#8A96A3] mb-0.5">Address</div>
              <div className="font-semibold text-[#1A2027]">{selected.address}</div>
            </div>
            {selected.dpName && (
              <>
                <div>
                  <div className="text-[#8A96A3] mb-0.5">Delivery Person</div>
                  <div className="font-semibold text-[#1A2027]">{selected.dpName}</div>
                </div>
                <div>
                  <div className="text-[#8A96A3] mb-0.5">Delivery Person Phone</div>
                  <div className="font-semibold text-[#1A2027]">{selected.dpPhone}</div>
                </div>
              </>
            )}
            {selected.cancelReason && (
              <div className="col-span-2">
                <div className="text-[#8A96A3] mb-0.5">Cancellation Reason</div>
                <div className="font-semibold text-[#D64545]">{selected.cancelReason}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
      {deliveries.length === 0 ? (
        <div className="px-4 py-6 text-center text-xs text-[#8A96A3]">No completed deliveries yet</div>
      ) : (
        deliveries.map((d) => (
          <div key={d.id} onClick={() => setSelected(d)} className="flex justify-between items-center px-4 py-3.5 border-b border-[#F0F2F4] last:border-0 cursor-pointer">
            <div>
              <div className="text-[13px] font-semibold text-[#1A2027]">
                {d.id} — {d.client}
              </div>
              <div className="text-[11px] text-[#8A96A3] mt-0.5">{fmtDate(d.deliveredAt)}</div>
            </div>
            <div className="text-[11px] font-bold shrink-0 ml-2" style={{ color: STATUS_COLORS[d.status] }}>
              {d.status}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
