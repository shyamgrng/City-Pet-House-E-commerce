"use client";

import { useB2B } from "@/context/B2BContext";
import { useB2BAuth } from "@/context/B2BAuthContext";
import { useOrder } from "@/context/OrderContext";
import { getFulfillment, ordersSentBySupplier } from "@/lib/order-fulfillment";
import { myProductIds } from "@/lib/b2b-analytics";

export default function StatusTab() {
  const { supplier } = useB2BAuth();
  const { submissions } = useB2B();
  const { orders } = useOrder();

  if (!supplier) return null;

  const ids = myProductIds(submissions, supplier.b2bId);
  const sent = ordersSentBySupplier(orders, submissions, supplier.b2bId);
  const awaitingCph = sent.filter((o) => o.status === "Payment Approved");
  const forwarded = sent.filter((o) => o.status !== "Payment Approved");

  const fmtDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const fmt = (n: number) => "Rs. " + n.toLocaleString("en-IN");

  const itemsSummary = (order: (typeof sent)[number]) =>
    order.items
      .filter((it) => ids.has(it.productId))
      .map((it) => `${it.name} × ${it.qty}`)
      .join(", ");

  return (
    <div>
      <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Sent — Awaiting City Pet House</div>
      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden mb-6">
        {awaitingCph.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">
            No shipments in transit — dispatch and delivery status will appear here once you ship stock against an order.
          </div>
        ) : (
          awaitingCph.map((o) => (
            <div key={o.id} className="flex justify-between items-center px-4 py-3.5 border-b border-[#F0F2F4] last:border-0">
              <div>
                <div className="text-[13px] font-semibold text-[#1A2027]">{o.id}</div>
                <div className="text-[11px] text-[#8A96A3] mt-0.5">
                  {itemsSummary(o)} · sent {fmtDate(getFulfillment(o, supplier.b2bId).sentAt ?? o.createdAt)}
                </div>
              </div>
              <div className="text-[11px] font-bold text-[#7A56C8] shrink-0 ml-3">Sent — awaiting City Pet House</div>
            </div>
          ))
        )}
      </div>

      <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Forwarded by City Pet House</div>
      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
        {forwarded.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">No completed shipments yet</div>
        ) : (
          forwarded.map((o) => (
            <div key={o.id} className="flex justify-between items-center px-4 py-3 border-b border-[#F0F2F4] last:border-0">
              <div>
                <div className="text-[13px] font-semibold text-[#1A2027]">{o.id}</div>
                <div className="text-[11px] text-[#8A96A3] mt-0.5">
                  {itemsSummary(o)} · {fmt(o.total)}
                </div>
              </div>
              <div className="text-[11px] font-bold text-[#1F7A4D] shrink-0 ml-3">{o.status}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
