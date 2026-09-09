"use client";

import { useB2B } from "@/context/B2BContext";
import { useCatalog } from "@/context/CatalogContext";
import { STATUS_COLORS, submissionToProductInput } from "@/lib/b2b-types";

export default function B2BSupplyPage() {
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
      <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-1">B2B Supply</div>
      <div className="text-xs text-[#5B6773] mb-4">
        Products submitted by B2B suppliers go live on the storefront immediately — remove a listing here if it needs to come down.
      </div>

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
