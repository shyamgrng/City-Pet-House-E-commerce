"use client";

import { useCatalog } from "@/context/CatalogContext";
import { useB2B } from "@/context/B2BContext";
import { STATUS_COLORS } from "@/lib/b2b-types";

export default function B2BSupplyPage() {
  const { submissions, approveSubmission, rejectSubmission } = useB2B();
  const { addProduct } = useCatalog();

  const pending = submissions.filter((s) => s.status === "Pending").sort((a, b) => a.submittedAt - b.submittedAt);
  const history = submissions.filter((s) => s.status !== "Pending").sort((a, b) => b.submittedAt - a.submittedAt);

  const fmtDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const approve = (id: string) => {
    const sub = submissions.find((s) => s.id === id);
    if (!sub) return;
    addProduct({
      name: sub.name,
      desc: sub.desc,
      photo: sub.photos[0] || "",
      photos: sub.photos,
      photoAlts: sub.photos.map(() => ""),
      category: sub.category,
      sku: sub.sku,
      brand: sub.brand,
      price: sub.price,
      costPrice: 0,
      rating: 0,
      qty: sub.qty,
      lowStockAlert: sub.lowStockAlert,
      sizes: sub.sizes,
      colours: sub.colours,
      suppliedBy: sub.companyName,
      commissionPercent: sub.commissionPct,
      courierPackageSize: sub.courierPackageSize,
      tags: sub.tags,
      newArrival: sub.newArrival,
      hotSale: sub.hotSale,
      hotDiscount: sub.hotDiscount,
      todaysDeal: sub.todaysDeal,
      dealStart: sub.dealStart,
      dealEnd: sub.dealEnd,
      outOfStock: sub.outOfStock,
      status: "active",
    });
    approveSubmission(id);
  };

  return (
    <div>
      <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-1">B2B Supply</div>
      <div className="text-xs text-[#5B6773] mb-4">Products submitted by B2B suppliers — pack and dispatch to stock</div>

      <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Pending Review</div>
      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden mb-6">
        {pending.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#8A96A3]">No product submissions from B2B suppliers yet</div>
        ) : (
          pending.map((s) => (
            <div key={s.id} className="flex justify-between items-center px-4 py-3.5 border-b border-[#F0F2F4] last:border-0">
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-[#1A2027]">{s.name}</div>
                <div className="text-[11px] text-[#8A96A3] mt-0.5">
                  {s.companyName} · {s.category} · Rs. {s.price.toLocaleString("en-IN")} × {s.qty} · {s.commissionPct}% commission · {fmtDate(s.submittedAt)}
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
          ))
        )}
      </div>

      {history.length > 0 && (
        <>
          <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">History</div>
          <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
            {history.map((s) => (
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
