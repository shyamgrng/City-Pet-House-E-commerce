"use client";

import { useState } from "react";
import PriceInput from "@/components/PriceInput";
import { useB2B } from "@/context/B2BContext";
import { useB2BAuth } from "@/context/B2BAuthContext";
import { useRestock } from "@/context/RestockContext";
import { RESTOCK_STATUS_COLORS, awaitsSupplier, restockValue } from "@/lib/restock-types";

export default function IncomingOrdersTab() {
  const { supplier } = useB2BAuth();
  const { submissions } = useB2B();
  const { orders, respondToOrder, createOrder } = useRestock();
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState(0);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!supplier) return null;

  const myLiveProducts = submissions.filter(
    (s) => s.b2bId === supplier.b2bId && s.status === "Approved" && s.listingStatus === "active" && s.productId,
  );
  const mine = orders.filter((o) => o.b2bId === supplier.b2bId);
  const incoming = mine.filter(awaitsSupplier).sort((a, b) => a.createdAt - b.createdAt);
  const myOffers = mine.filter((o) => o.initiatedBy === "Supplier").sort((a, b) => b.createdAt - a.createdAt);
  const declinedRequests = mine
    .filter((o) => o.initiatedBy === "Admin" && o.status === "Declined")
    .sort((a, b) => b.createdAt - a.createdAt);

  const fmtDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const fmt = (n: number) => "Rs. " + n.toLocaleString("en-IN");

  const selected = myLiveProducts.find((s) => s.productId === productId);

  const resetForm = () => {
    setProductId("");
    setQty("");
    setPrice(0);
    setNote("");
    setError("");
  };

  const submitOffer = () => {
    const q = Number(qty) || 0;
    if (!selected || q <= 0 || price <= 0) {
      setError("Pick a product and enter a quantity and price.");
      return;
    }
    createOrder({
      b2bId: supplier.b2bId,
      companyName: supplier.companyName,
      productId: selected.productId!,
      productName: selected.name,
      qty: q,
      unitPrice: price,
      note: note.trim(),
      initiatedBy: "Supplier",
    });
    resetForm();
    setOpen(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div>
      <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">New Restock Requests from City Pet House</div>
      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden mb-6">
        {incoming.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">
            No incoming stock orders yet — this will show here once City Pet House places a restock order with you.
          </div>
        ) : (
          incoming.map((o) => (
            <div key={o.id} className="flex justify-between items-center px-4 py-3.5 border-b border-[#F0F2F4] last:border-0">
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-[#1A2027]">{o.productName}</div>
                <div className="text-[11px] text-[#8A96A3] mt-0.5">
                  {o.qty} units × {fmt(o.unitPrice)} = {fmt(restockValue(o))} · {fmtDate(o.createdAt)}
                </div>
                {o.note && <div className="text-[11px] text-[#5B6773] mt-1 italic">&ldquo;{o.note}&rdquo;</div>}
              </div>
              <div className="flex gap-2 shrink-0 ml-3">
                <button
                  onClick={() => respondToOrder(o.id, true)}
                  className="bg-[#1F7A4D] text-white px-3.5 py-2 rounded-md text-[11px] font-semibold cursor-pointer"
                >
                  Accept
                </button>
                <button
                  onClick={() => respondToOrder(o.id, false)}
                  className="bg-[#F0F2F4] text-[#D64545] px-3.5 py-2 rounded-md text-[11px] font-semibold cursor-pointer"
                >
                  Decline
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-between items-center mb-2.5">
        <div className="text-[13px] font-bold text-[#1A2027]">Your Restock Offers</div>
        <button
          onClick={() => {
            if (!open && !productId) setProductId(myLiveProducts[0]?.productId ?? "");
            setOpen((o) => !o);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
        >
          {open ? "Cancel" : "+ Offer Restock"}
        </button>
      </div>

      {open && (
        <div className="border border-[#E4E9EC] rounded-xl p-4 mb-4.5">
          {myLiveProducts.length === 0 ? (
            <div className="text-xs text-[#8A96A3]">You don&apos;t have any live products to offer a restock for yet.</div>
          ) : (
            <>
              <div className="text-xs font-semibold text-[#1A2027] mb-1.5">Product</div>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-3 box-border"
              >
                {myLiveProducts.map((s) => (
                  <option key={s.productId} value={s.productId!}>
                    {s.name}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-2.5 mb-3">
                <div>
                  <div className="text-xs font-semibold text-[#1A2027] mb-1.5">Qty Available</div>
                  <input
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] box-border"
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#1A2027] mb-1.5">Unit Price (Rs.)</div>
                  <PriceInput value={price} onChange={setPrice} />
                </div>
              </div>

              <div className="text-xs font-semibold text-[#1A2027] mb-1.5">Note (optional)</div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-3 resize-none box-border"
              />

              {error && <div className="text-xs text-[#D64545] mb-2.5">{error}</div>}
              <button onClick={submitOffer} className="bg-primary text-white px-4 py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer">
                Send Offer to City Pet House
              </button>
            </>
          )}
        </div>
      )}
      {submitted && <div className="text-[11px] text-[#1F7A4D] mb-4 -mt-2.5">✓ Offer sent — City Pet House will review it shortly</div>}

      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
        {myOffers.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">You haven&apos;t offered any restocks yet</div>
        ) : (
          myOffers.map((o) => (
            <div key={o.id} className="flex justify-between items-center px-4 py-3 border-b border-[#F0F2F4] last:border-0">
              <div>
                <div className="text-[13px] font-semibold text-[#1A2027]">{o.productName}</div>
                <div className="text-[11px] text-[#8A96A3] mt-0.5">
                  {o.qty} units × {fmt(o.unitPrice)} · {fmtDate(o.createdAt)}
                </div>
              </div>
              <div className="text-[11px] font-bold shrink-0 ml-2" style={{ color: RESTOCK_STATUS_COLORS[o.status] }}>
                {o.status === "Pending" ? "Awaiting City Pet House" : o.status}
              </div>
            </div>
          ))
        )}
      </div>

      {declinedRequests.length > 0 && (
        <>
          <div className="text-[13px] font-bold text-[#1A2027] mb-2.5 mt-6">Declined Requests</div>
          <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
            {declinedRequests.map((o) => (
              <div key={o.id} className="flex justify-between items-center px-4 py-3 border-b border-[#F0F2F4] last:border-0">
                <div>
                  <div className="text-[13px] font-semibold text-[#1A2027]">{o.productName}</div>
                  <div className="text-[11px] text-[#8A96A3] mt-0.5">
                    {o.qty} units × {fmt(o.unitPrice)} · {fmtDate(o.createdAt)}
                  </div>
                </div>
                <div className="text-[11px] font-bold shrink-0 ml-2" style={{ color: RESTOCK_STATUS_COLORS.Declined }}>
                  Declined
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
