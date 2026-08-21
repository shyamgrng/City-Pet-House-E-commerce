"use client";

import { useState } from "react";
import PriceInput from "@/components/PriceInput";
import { useB2B } from "@/context/B2BContext";
import { useB2BAuth } from "@/context/B2BAuthContext";
import { STATUS_COLORS } from "@/lib/b2b-types";
import { shopCategories } from "@/lib/catalog-types";

const EMPTY = { name: "", desc: "", category: shopCategories[0], brand: "", price: "", qty: "", commissionPct: "15" };

export default function ProductsTab() {
  const { supplier } = useB2BAuth();
  const { submissions, addSubmission } = useB2B();
  const [form, setForm] = useState(EMPTY);
  const [submitted, setSubmitted] = useState(false);

  if (!supplier) return null;

  const mine = submissions.filter((s) => s.b2bId === supplier.b2bId).sort((a, b) => b.submittedAt - a.submittedAt);

  const price = Number(form.price) || 0;
  const qty = Number(form.qty) || 0;
  const commissionPct = Number(form.commissionPct) || 0;
  const netEstimate = Math.round(price * qty * (1 - commissionPct / 100));

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const canSubmit = form.name.trim() && form.desc.trim() && form.brand.trim() && price > 0 && qty > 0;

  const submit = () => {
    if (!canSubmit) return;
    addSubmission({
      b2bId: supplier.b2bId,
      companyName: supplier.companyName,
      name: form.name.trim(),
      desc: form.desc.trim(),
      category: form.category,
      brand: form.brand.trim(),
      price,
      qty,
      commissionPct,
    });
    setForm(EMPTY);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const fmtDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div>
      <div className="border border-[#E4E9EC] rounded-xl p-5 mb-6">
        <div className="text-[13px] font-bold text-[#1A2027] mb-3.5">Submit a New Product</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Field label="Product Name">
            <input value={form.name} onChange={(e) => set({ name: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Brand">
            <input value={form.brand} onChange={(e) => set({ brand: e.target.value })} className={inputCls} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea value={form.desc} onChange={(e) => set({ desc: e.target.value })} rows={2} className={inputCls + " resize-none"} />
            </Field>
          </div>
          <Field label="Category">
            <select value={form.category} onChange={(e) => set({ category: e.target.value })} className={inputCls}>
              {shopCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Price per Unit (Rs.)">
            <PriceInput value={price} onChange={(v) => set({ price: v ? String(v) : "" })} className="" />
          </Field>
          <Field label="Quantity Supplied">
            <input type="number" value={form.qty} onChange={(e) => set({ qty: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Commission to City Pet House (%)">
            <input type="number" value={form.commissionPct} onChange={(e) => set({ commissionPct: e.target.value })} className={inputCls} />
          </Field>
        </div>

        {price > 0 && qty > 0 && (
          <div className="mt-3.5 px-3.5 py-2.5 bg-[#F7F9FA] rounded-lg text-xs text-[#5B6773]">
            Estimated payout if approved &amp; fully sold: <span className="font-bold text-[#1F7A4D]">Rs. {netEstimate.toLocaleString("en-IN")}</span>
          </div>
        )}

        <button
          onClick={submit}
          disabled={!canSubmit}
          className="mt-3.5 bg-primary text-white px-5 py-2.5 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Submit for Review
        </button>
        {submitted && <div className="text-[11px] text-[#1F7A4D] mt-2">✓ Submitted — City Pet House will review this product shortly</div>}
      </div>

      <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">My Submissions</div>
      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
        {mine.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">You haven&apos;t submitted any products yet</div>
        ) : (
          mine.map((s) => (
            <div key={s.id} className="flex justify-between items-center px-4 py-3 border-b border-[#F0F2F4] last:border-0">
              <div>
                <div className="text-[13px] font-semibold text-[#1A2027]">{s.name}</div>
                <div className="text-[11px] text-[#8A96A3] mt-0.5">
                  {s.category} · Rs. {s.price.toLocaleString("en-IN")} × {s.qty} · {fmtDate(s.submittedAt)}
                </div>
              </div>
              <div className="text-[11px] font-bold shrink-0 ml-2" style={{ color: STATUS_COLORS[s.status] }}>
                {s.status}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] box-border";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold text-[#3A4652] mb-1.5">{label}</div>
      {children}
    </div>
  );
}
