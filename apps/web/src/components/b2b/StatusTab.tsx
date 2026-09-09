"use client";

import { useB2BAuth } from "@/context/B2BAuthContext";
import { useRestock } from "@/context/RestockContext";
import { RESTOCK_STATUS_COLORS, restockValue } from "@/lib/restock-types";

export default function StatusTab() {
  const { supplier } = useB2BAuth();
  const { orders, markDispatched } = useRestock();

  if (!supplier) return null;

  const mine = orders.filter((o) => o.b2bId === supplier.b2bId);
  const inProgress = mine.filter((o) => o.status === "Accepted" || o.status === "Dispatched").sort((a, b) => b.createdAt - a.createdAt);
  const delivered = mine.filter((o) => o.status === "Delivered").sort((a, b) => (b.deliveredAt ?? 0) - (a.deliveredAt ?? 0));

  const fmtDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const fmt = (n: number) => "Rs. " + n.toLocaleString("en-IN");

  return (
    <div>
      <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Shipments in Progress</div>
      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden mb-6">
        {inProgress.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">
            No shipments in transit — dispatch and delivery status will appear here once you ship stock against an order.
          </div>
        ) : (
          inProgress.map((o) => (
            <div key={o.id} className="flex justify-between items-center px-4 py-3.5 border-b border-[#F0F2F4] last:border-0">
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-[#1A2027]">{o.productName}</div>
                <div className="text-[11px] text-[#8A96A3] mt-0.5">
                  {o.qty} units × {fmt(o.unitPrice)} = {fmt(restockValue(o))} · accepted {fmtDate(o.respondedAt ?? o.createdAt)}
                </div>
              </div>
              <div className="shrink-0 ml-3 flex items-center gap-3">
                {o.status === "Accepted" ? (
                  <button
                    onClick={() => markDispatched(o.id)}
                    className="bg-[#1996C8] text-white px-3.5 py-2 rounded-md text-[11px] font-semibold cursor-pointer"
                  >
                    Mark as Dispatched
                  </button>
                ) : (
                  <div className="text-[11px] font-bold" style={{ color: RESTOCK_STATUS_COLORS.Dispatched }}>
                    Dispatched — awaiting City Pet House
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Delivered</div>
      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
        {delivered.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">No completed restocks yet</div>
        ) : (
          delivered.map((o) => (
            <div key={o.id} className="flex justify-between items-center px-4 py-3 border-b border-[#F0F2F4] last:border-0">
              <div>
                <div className="text-[13px] font-semibold text-[#1A2027]">{o.productName}</div>
                <div className="text-[11px] text-[#8A96A3] mt-0.5">
                  {o.qty} units × {fmt(o.unitPrice)} · delivered {fmtDate(o.deliveredAt ?? o.createdAt)}
                </div>
              </div>
              <div className="text-[11px] font-bold shrink-0 ml-2" style={{ color: RESTOCK_STATUS_COLORS.Delivered }}>
                Delivered
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
