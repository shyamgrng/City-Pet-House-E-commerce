"use client";

import { useState } from "react";
import PriceInput from "@/components/PriceInput";
import { useB2B } from "@/context/B2BContext";
import { useCatalog } from "@/context/CatalogContext";
import { useRestock } from "@/context/RestockContext";
import type { B2BProductSubmission } from "@/lib/b2b-types";
import { STATUS_COLORS, submissionToProductInput } from "@/lib/b2b-types";
import type { Product } from "@/lib/catalog-types";
import { RESTOCK_STATUS_COLORS, awaitsAdmin, restockValue } from "@/lib/restock-types";

const SECTIONS = ["Product Listings", "Restock Orders"] as const;
type Section = (typeof SECTIONS)[number];

export default function B2BSupplyPage() {
  const [section, setSection] = useState<Section>("Product Listings");
  const { orders } = useRestock();
  const pendingRestocks = orders.filter(awaitsAdmin).length;

  return (
    <div>
      <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-1">B2B Supply</div>
      <div className="text-xs text-[#5B6773] mb-4">Manage what B2B suppliers list on the storefront and request restocks from them.</div>

      <div className="flex gap-2 mb-5">
        {SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className="px-4 py-2 rounded-full text-xs font-semibold cursor-pointer border border-[#E4E9EC] flex items-center gap-1.5"
            style={{ background: section === s ? "#1996C8" : "#fff", color: section === s ? "#fff" : "#3A4652" }}
          >
            {s}
            {s === "Restock Orders" && pendingRestocks > 0 && (
              <span
                className="min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
                style={{ background: section === s ? "#fff" : "#D64545", color: section === s ? "#1996C8" : "#fff" }}
              >
                {pendingRestocks}
              </span>
            )}
          </button>
        ))}
      </div>

      {section === "Product Listings" ? <ProductListingsSection /> : <RestockOrdersSection />}
    </div>
  );
}

function ProductListingsSection() {
  const { submissions, approveSubmission, rejectSubmission } = useB2B();
  const { addProduct, deleteProduct } = useCatalog();

  // Legacy records only — new submissions are listed on the storefront immediately, so this
  // stays empty going forward unless older Pending data exists from before that change.
  const pending = submissions.filter((s) => s.status === "Pending").sort((a, b) => a.submittedAt - b.submittedAt);
  const live = submissions.filter((s) => s.status === "Approved").sort((a, b) => b.submittedAt - a.submittedAt);
  const removed = submissions.filter((s) => s.status === "Rejected").sort((a, b) => b.submittedAt - a.submittedAt);

  const fmtDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const approve = (id: string) => {
    const sub = submissions.find((s) => s.id === id);
    if (!sub) return;
    const productId = addProduct(submissionToProductInput(sub));
    approveSubmission(id, productId);
  };

  const removeFromStore = (id: string) => {
    const sub = submissions.find((s) => s.id === id);
    if (!sub) return;
    if (sub.productId) deleteProduct(sub.productId);
    rejectSubmission(id);
  };

  return (
    <div>
      {pending.length > 0 && (
        <>
          <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Pending Review</div>
          <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden mb-6">
            {pending.map((s) => (
              <div key={s.id} className="flex justify-between items-center px-4 py-3.5 border-b border-[#F0F2F4] last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-[#1A2027]">{s.name}</div>
                  <div className="text-[11px] text-[#8A96A3] mt-0.5">
                    {s.companyName} · {s.category} · Rs. {s.price.toLocaleString("en-IN")} × {s.qty} · {s.commissionPct}% commission ·{" "}
                    {fmtDate(s.submittedAt)}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 ml-3">
                  <button
                    onClick={() => approve(s.id)}
                    className="bg-[#1F7A4D] text-white px-3.5 py-2 rounded-md text-[11px] font-semibold cursor-pointer"
                  >
                    Approve &amp; Add to Stock
                  </button>
                  <button
                    onClick={() => rejectSubmission(s.id)}
                    className="bg-[#F0F2F4] text-[#D64545] px-3.5 py-2 rounded-md text-[11px] font-semibold cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Live on Storefront</div>
      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden mb-6">
        {live.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#8A96A3]">No product submissions from B2B suppliers yet</div>
        ) : (
          live.map((s) => (
            <div key={s.id} className="flex justify-between items-center px-4 py-3.5 border-b border-[#F0F2F4] last:border-0">
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-[#1A2027]">{s.name}</div>
                <div className="text-[11px] text-[#8A96A3] mt-0.5">
                  {s.companyName} · {s.category} · Rs. {s.price.toLocaleString("en-IN")} × {s.qty} · {s.commissionPct}% commission ·{" "}
                  {fmtDate(s.submittedAt)}
                </div>
              </div>
              <button
                onClick={() => removeFromStore(s.id)}
                className="bg-[#F0F2F4] text-[#D64545] px-3.5 py-2 rounded-md text-[11px] font-semibold cursor-pointer shrink-0 ml-3"
              >
                Remove from Store
              </button>
            </div>
          ))
        )}
      </div>

      {removed.length > 0 && (
        <>
          <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Removed</div>
          <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
            {removed.map((s) => (
              <div key={s.id} className="flex justify-between items-center px-4 py-3 border-b border-[#F0F2F4] last:border-0">
                <div>
                  <div className="text-[13px] font-semibold text-[#1A2027]">{s.name}</div>
                  <div className="text-[11px] text-[#8A96A3] mt-0.5">
                    {s.companyName} · {fmtDate(s.submittedAt)}
                  </div>
                </div>
                <div className="text-[11px] font-bold" style={{ color: STATUS_COLORS[s.status] }}>
                  {s.status}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function RestockOrdersSection() {
  const { submissions } = useB2B();
  const { products, updateProduct } = useCatalog();
  const { orders, createOrder, respondToOrder, markDelivered } = useRestock();
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState(0);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const fmtDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const fmt = (n: number) => "Rs. " + n.toLocaleString("en-IN");

  // Only products that came in through a B2B submission have a supplier to restock from.
  const restockableProducts: { product: Product; sub: B2BProductSubmission }[] = products.flatMap((p) => {
    const sub = submissions.find((s) => s.productId === p.id);
    return sub ? [{ product: p, sub }] : [];
  });

  const offers = orders.filter(awaitsAdmin).sort((a, b) => a.createdAt - b.createdAt);
  const inProgress = orders.filter((o) => o.status === "Accepted" || o.status === "Dispatched").sort((a, b) => b.createdAt - a.createdAt);
  const history = orders.filter((o) => o.status === "Delivered" || o.status === "Declined").sort((a, b) => b.createdAt - a.createdAt);

  const selected = restockableProducts.find((x) => x.product.id === productId);

  const submitRequest = () => {
    const q = Number(qty) || 0;
    if (!selected || q <= 0 || price <= 0) {
      setError("Pick a product and enter a quantity and price.");
      return;
    }
    createOrder({
      b2bId: selected.sub.b2bId,
      companyName: selected.sub.companyName,
      productId: selected.product.id,
      productName: selected.product.name,
      qty: q,
      unitPrice: price,
      note: note.trim(),
      initiatedBy: "Admin",
    });
    setProductId("");
    setQty("");
    setPrice(0);
    setNote("");
    setError("");
    setOpen(false);
  };

  const receiveDelivery = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const product = products.find((p) => p.id === order.productId);
    if (product) {
      const { id, ...rest } = product;
      updateProduct(id, { ...rest, qty: rest.qty + order.qty });
    }
    markDelivered(orderId);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2.5">
        <div className="text-[13px] font-bold text-[#1A2027]">Request a Restock</div>
        <button
          onClick={() => {
            if (!open && !productId) setProductId(restockableProducts[0]?.product.id ?? "");
            setOpen((o) => !o);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
        >
          {open ? "Cancel" : "+ New Restock Request"}
        </button>
      </div>

      {open && (
        <div className="border border-[#E4E9EC] rounded-xl p-4 mb-6">
          {restockableProducts.length === 0 ? (
            <div className="text-xs text-[#8A96A3]">No B2B-supplied products in the catalog yet.</div>
          ) : (
            <>
              <div className="text-xs font-semibold text-[#1A2027] mb-1.5">Product</div>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-3 box-border"
              >
                {restockableProducts.map((x) => (
                  <option key={x.product.id} value={x.product.id}>
                    {x.product.name} — {x.sub.companyName}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-2.5 mb-3">
                <div>
                  <div className="text-xs font-semibold text-[#1A2027] mb-1.5">Qty Needed</div>
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
              <button onClick={submitRequest} className="bg-primary text-white px-4 py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer">
                Send Request to Supplier
              </button>
            </>
          )}
        </div>
      )}

      <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Restock Offers from Suppliers</div>
      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden mb-6">
        {offers.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#8A96A3]">No restock offers waiting on you</div>
        ) : (
          offers.map((o) => (
            <div key={o.id} className="flex justify-between items-center px-4 py-3.5 border-b border-[#F0F2F4] last:border-0">
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-[#1A2027]">{o.productName}</div>
                <div className="text-[11px] text-[#8A96A3] mt-0.5">
                  {o.companyName} · {o.qty} units × {fmt(o.unitPrice)} = {fmt(restockValue(o))} · {fmtDate(o.createdAt)}
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

      <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">In Progress</div>
      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden mb-6">
        {inProgress.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#8A96A3]">No restock orders in progress</div>
        ) : (
          inProgress.map((o) => (
            <div key={o.id} className="flex justify-between items-center px-4 py-3.5 border-b border-[#F0F2F4] last:border-0">
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-[#1A2027]">{o.productName}</div>
                <div className="text-[11px] text-[#8A96A3] mt-0.5">
                  {o.companyName} · {o.qty} units × {fmt(o.unitPrice)} · {fmtDate(o.createdAt)}
                </div>
              </div>
              <div className="shrink-0 ml-3">
                {o.status === "Dispatched" ? (
                  <button
                    onClick={() => receiveDelivery(o.id)}
                    className="bg-[#1F7A4D] text-white px-3.5 py-2 rounded-md text-[11px] font-semibold cursor-pointer"
                  >
                    Mark as Delivered
                  </button>
                ) : (
                  <div className="text-[11px] font-bold" style={{ color: RESTOCK_STATUS_COLORS.Accepted }}>
                    Accepted — awaiting dispatch
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {history.length > 0 && (
        <>
          <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">History</div>
          <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
            {history.map((o) => (
              <div key={o.id} className="flex justify-between items-center px-4 py-3 border-b border-[#F0F2F4] last:border-0">
                <div>
                  <div className="text-[13px] font-semibold text-[#1A2027]">{o.productName}</div>
                  <div className="text-[11px] text-[#8A96A3] mt-0.5">
                    {o.companyName} · {o.qty} units × {fmt(o.unitPrice)} · {fmtDate(o.createdAt)}
                  </div>
                </div>
                <div className="text-[11px] font-bold shrink-0 ml-2" style={{ color: RESTOCK_STATUS_COLORS[o.status] }}>
                  {o.status}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
