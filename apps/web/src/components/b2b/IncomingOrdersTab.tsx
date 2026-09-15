"use client";

import { useState } from "react";
import { myProductIds } from "@/lib/b2b-analytics";
import { useB2B } from "@/context/B2BContext";
import { useB2BAuth } from "@/context/B2BAuthContext";
import { useCatalog } from "@/context/CatalogContext";
import { useOrder } from "@/context/OrderContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { getFulfillment, ordersNeedingFulfillment } from "@/lib/order-fulfillment";
import type { Order } from "@/lib/order-types";

export default function IncomingOrdersTab() {
  const { supplier } = useB2BAuth();
  const { submissions } = useB2B();
  const { orders, toggleSupplierChecklistItem, markSentBySupplier } = useOrder();
  const { products, updateProduct } = useCatalog();
  const { settings } = useSiteSettings();
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  if (!supplier) return null;

  const ids = myProductIds(submissions, supplier.b2bId);
  const incoming = ordersNeedingFulfillment(orders, submissions, supplier.b2bId);
  const openOrder = incoming.find((o) => o.id === openOrderId) ?? null;

  const fmtDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const fmt = (n: number) => "Rs. " + n.toLocaleString("en-IN");

  const markOutOfStock = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const { id, ...rest } = product;
    updateProduct(id, { ...rest, outOfStock: true });
  };

  return (
    <div>
      <div className="text-[13px] font-bold text-[#1A2027] mb-1">Orders Needing Your Products</div>
      <div className="text-[11px] text-[#8A96A3] mb-2.5">
        A client&apos;s order was approved and includes your product(s) — collect and send them to City Pet House.
      </div>

      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
        {incoming.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">
            No incoming orders yet — this will show here once a client&apos;s approved order includes one of your products.
          </div>
        ) : (
          incoming.map((o) => {
            const mine = o.items.filter((it) => ids.has(it.productId));
            const fulfillment = getFulfillment(o, supplier.b2bId);
            const sent = Boolean(fulfillment.sentAt);
            return (
              <div
                key={o.id}
                onClick={() => setOpenOrderId(o.id)}
                className="px-4 py-3.5 border-b border-[#F0F2F4] last:border-0 cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[13px] font-semibold text-[#1A2027]">{o.id}</div>
                    <div className="text-[11px] text-[#8A96A3] mt-0.5">
                      {o.ownerName} · {fmtDate(o.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <div
                      className="w-4 h-4 rounded border-2 border-primary flex items-center justify-center shrink-0"
                      style={{ background: sent ? "#EAF4F9" : "#fff" }}
                    >
                      {sent && <span className="text-primary text-[11px] font-bold">✓</span>}
                    </div>
                    <div className="text-[11px] font-semibold text-primary">Mark as Sent to CPH</div>
                  </div>
                </div>
                <div className="mt-2.5 bg-[#F7F9FA] rounded-lg px-3 py-2">
                  {mine.map((it, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <div className="text-[#3A4652]">
                        {it.name} × {it.qty}
                      </div>
                      <div className="font-semibold text-[#1A2027]">{fmt(it.price * it.qty)}</div>
                    </div>
                  ))}
                </div>
                <div className="text-[11px] text-[#8A96A3] mt-2">
                  📦 Dispatch to: <span className="font-semibold text-[#3A4652]">{settings.address}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {openOrder && (
        <SupplierOrderModal
          order={openOrder}
          b2bId={supplier.b2bId}
          productIds={ids}
          onClose={() => setOpenOrderId(null)}
          onToggleChecklist={(index) => toggleSupplierChecklistItem(openOrder.id, supplier.b2bId, index)}
          onMarkSent={() => {
            markSentBySupplier(openOrder.id, supplier.b2bId);
            setOpenOrderId(null);
          }}
          onMarkOutOfStock={markOutOfStock}
        />
      )}
    </div>
  );
}

function SupplierOrderModal({
  order,
  b2bId,
  productIds,
  onClose,
  onToggleChecklist,
  onMarkSent,
  onMarkOutOfStock,
}: {
  order: Order;
  b2bId: string;
  productIds: Set<string>;
  onClose: () => void;
  onToggleChecklist: (index: number) => void;
  onMarkSent: () => void;
  onMarkOutOfStock: (productId: string) => void;
}) {
  const fmtDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const fmt = (n: number) => "Rs. " + n.toLocaleString("en-IN");
  const mine = order.items.filter((it) => productIds.has(it.productId));
  const mineTotal = mine.reduce((sum, it) => sum + it.price * it.qty, 0);
  const fulfillment = getFulfillment(order, b2bId);
  const allChecked = fulfillment.checklist.every((c) => c.checked);

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-[420px] max-h-[88vh] overflow-auto">
        <div className="flex justify-between items-center mb-1">
          <div className="text-base font-bold text-[#1A2027]">{order.id}</div>
          <div onClick={onClose} className="text-base text-[#8A96A3] cursor-pointer">
            ✕
          </div>
        </div>
        <div className="text-xs text-[#8A96A3] mb-4">{fmtDate(order.createdAt)}</div>

        <div className="text-[11px] font-bold text-[#8A96A3] uppercase mb-1.5">Client Details</div>
        <div className="text-[13px] font-semibold text-[#1A2027] mb-0.5">{order.ownerName}</div>
        <div className="text-xs text-[#5B6773] mb-0.5">📞 {order.ownerPhone}</div>
        <div className="text-xs text-[#5B6773] mb-3.5">📍 {order.address}</div>

        <div className="flex justify-between items-center py-2.5 border-t border-b border-[#EEF1F3] mb-3.5">
          <div className="text-xs text-[#5B6773]">Payment</div>
          <div className="text-xs font-semibold text-[#1F7A4D]">{order.status}</div>
        </div>

        <div className="text-[11px] font-bold text-[#8A96A3] uppercase mb-2">Product List</div>
        {mine.map((it, i) => (
          <div key={i} className="py-1.5">
            <div className="flex justify-between items-center text-xs">
              <div className="text-[#3A4652]">
                {it.name} × {it.qty}
              </div>
              <div className="font-semibold text-[#1A2027]">{fmt(it.price * it.qty)}</div>
            </div>
            <div onClick={() => onMarkOutOfStock(it.productId)} className="text-[11px] font-semibold text-[#D64545] cursor-pointer mt-0.5">
              Mark Out of Stock
            </div>
          </div>
        ))}

        <div className="text-[11px] font-bold text-[#8A96A3] uppercase mt-3.5 mb-2">Order Checklist</div>
        {fulfillment.checklist.map((c, i) => (
          <div key={i} onClick={() => onToggleChecklist(i)} className="flex items-center gap-2 py-1 cursor-pointer">
            <div
              className="w-4 h-4 rounded border-2 border-primary flex items-center justify-center shrink-0"
              style={{ background: c.checked ? "#EAF4F9" : "#fff" }}
            >
              {c.checked && <span className="text-primary text-[11px] font-bold">✓</span>}
            </div>
            <div className="text-xs text-[#3A4652]">{c.text}</div>
          </div>
        ))}

        <div className="flex justify-between items-center py-3 mt-2.5 border-t border-[#EEF1F3]">
          <div className="text-xs text-[#8A96A3]">Total</div>
          <div className="text-sm font-bold text-[#1A2027]">{fmt(mineTotal)}</div>
        </div>

        {allChecked ? (
          <button onClick={onMarkSent} className="w-full bg-primary text-white text-center py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer mt-2">
            Mark as Sent to CPH
          </button>
        ) : (
          <div className="bg-[#F0F2F4] text-[#8A96A3] text-center py-2.5 rounded-lg text-xs font-semibold mt-2">
            Complete checklist to mark as sent
          </div>
        )}
      </div>
    </div>
  );
}
