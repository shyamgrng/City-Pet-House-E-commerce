"use client";

import { useState } from "react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import PriceInput from "@/components/PriceInput";
import { useB2B } from "@/context/B2BContext";
import { useB2BAuth } from "@/context/B2BAuthContext";
import { STATUS_COLORS } from "@/lib/b2b-types";
import { brandNames, colourOptions, courierPackageSizes, shopCategories, sizeOptions } from "@/lib/catalog-types";

const EMPTY = {
  photos: ["", "", "", ""],
  name: "",
  desc: "",
  category: shopCategories[0],
  price: "",
  qty: "",
  lowStockAlert: "5",
  sizes: [] as string[],
  colours: [] as string[],
  brand: "",
  courierPackageSize: courierPackageSizes[1],
  tags: "",
  commissionPct: "15",
  newArrival: false,
  hotSale: false,
  hotDiscount: "20",
  todaysDeal: false,
  dealStart: "",
  dealEnd: "",
  outOfStock: false,
  status: "Active" as "Active" | "Draft",
};

export default function ProductsTab() {
  const { supplier } = useB2BAuth();
  const { submissions, addSubmission } = useB2B();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!supplier) return null;

  const mine = submissions.filter((s) => s.b2bId === supplier.b2bId).sort((a, b) => b.submittedAt - a.submittedAt);
  const sku = "SKU-" + supplier.b2bId.replace(/\D/g, "").slice(-4) + "-" + (mine.length + 1);

  const price = Number(form.price) || 0;
  const commissionPct = Number(form.commissionPct) || 0;
  const commissionAmount = Math.round((price * commissionPct) / 100);
  const netPayable = price - commissionAmount;
  const salePricePreview = form.hotSale ? Math.round(price * (1 - (Number(form.hotDiscount) || 0) / 100)) : price;

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));
  const toggleInArray = (key: "sizes" | "colours", value: string) =>
    setForm((f) => ({ ...f, [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value] }));

  const canSubmit = form.name.trim() && form.category.trim() && price > 0 && (Number(form.qty) || 0) > 0;

  const submit = () => {
    if (!canSubmit) {
      setError("Please fill in name, category, price, and quantity.");
      return;
    }
    addSubmission({
      b2bId: supplier.b2bId,
      companyName: supplier.companyName,
      name: form.name.trim(),
      desc: form.desc.trim(),
      photos: form.photos.filter(Boolean),
      category: form.category,
      sku,
      brand: form.brand.trim(),
      price,
      qty: Number(form.qty) || 0,
      lowStockAlert: Number(form.lowStockAlert) || 5,
      sizes: form.sizes,
      colours: form.colours,
      courierPackageSize: form.courierPackageSize,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      newArrival: form.newArrival,
      hotSale: form.hotSale,
      hotDiscount: Number(form.hotDiscount) || 0,
      todaysDeal: form.todaysDeal,
      dealStart: form.dealStart,
      dealEnd: form.dealEnd,
      outOfStock: form.outOfStock,
      commissionPct,
    });
    setForm(EMPTY);
    setError("");
    setOpen(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const fmtDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-[13px] font-bold text-[#1A2027]">Your Products ({mine.length})</div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="bg-primary text-white px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer"
        >
          {open ? "Cancel" : "+ Add Product"}
        </button>
      </div>

      {open && (
        <div className="border border-[#E4E9EC] rounded-xl p-4 mb-4.5">
          <Label>Product Photos</Label>
          <div className="grid grid-cols-3 gap-2.5 mb-3.5">
            {[0, 1, 2, 3].map((i) => (
              <ImageUploadField
                key={i}
                value={form.photos[i]}
                onChange={(v) =>
                  setForm((f) => {
                    const photos = [...f.photos];
                    photos[i] = v;
                    return { ...f, photos };
                  })
                }
                label={`Photo ${i + 1}`}
                height="h-[80px]"
                maxWidth={800}
                maxHeight={800}
              />
            ))}
          </div>

          <Label>Product Name *</Label>
          <input value={form.name} onChange={(e) => set({ name: e.target.value })} className={inputCls + " mb-3"} />

          <Label>Description</Label>
          <textarea value={form.desc} onChange={(e) => set({ desc: e.target.value })} rows={2} className={inputCls + " mb-3 resize-none"} />

          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <div>
              <Label>Category *</Label>
              <select value={form.category} onChange={(e) => set({ category: e.target.value })} className={inputCls}>
                {shopCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>SKU / Barcode</Label>
              <input value={sku} readOnly className={inputCls + " bg-[#F7F9FA]"} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <div>
              <Label>Selling Price (Rs.) *</Label>
              <PriceInput value={price} onChange={(v) => set({ price: v ? String(v) : "" })} />
            </div>
            <div>
              <Label>Qty in Stock *</Label>
              <input type="number" value={form.qty} onChange={(e) => set({ qty: e.target.value })} className={inputCls} />
            </div>
          </div>

          <Label>Low Stock Alert</Label>
          <input type="number" value={form.lowStockAlert} onChange={(e) => set({ lowStockAlert: e.target.value })} className={inputCls + " mb-3"} />

          <Label>Size(s)</Label>
          <div className="flex gap-2 mb-3.5 flex-wrap">
            {sizeOptions.map((sz) => (
              <Chip key={sz} active={form.sizes.includes(sz)} onClick={() => toggleInArray("sizes", sz)}>
                {sz}
              </Chip>
            ))}
          </div>

          <Label>Colour(s)</Label>
          <div className="flex gap-2.5 mb-3.5 flex-wrap">
            {colourOptions.map((col) => {
              const active = form.colours.includes(col.name);
              return (
                <div
                  key={col.name}
                  onClick={() => toggleInArray("colours", col.name)}
                  className="flex items-center gap-1.5 pl-1.5 pr-3 py-1.5 rounded-full cursor-pointer"
                  style={{ background: active ? "#EAF4F9" : "#F7F9FA", border: `1px solid ${active ? "#1996C8" : "#E4E9EC"}` }}
                >
                  <span className="w-[18px] h-[18px] rounded-full border border-black/10" style={{ background: col.hex }} />
                  <span className="text-xs font-semibold" style={{ color: active ? "#1996C8" : "#5B6773" }}>
                    {col.name}
                  </span>
                </div>
              );
            })}
          </div>

          <Label>Brand</Label>
          <select value={form.brand} onChange={(e) => set({ brand: e.target.value })} className={inputCls + " mb-3.5"}>
            <option value="">— No brand —</option>
            {brandNames.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <Label>Courier Package Size</Label>
          <div className="flex gap-2 mb-3.5 flex-wrap">
            {courierPackageSizes.map((cs) => (
              <Chip key={cs} active={form.courierPackageSize === cs} onClick={() => set({ courierPackageSize: cs })}>
                {cs}
              </Chip>
            ))}
          </div>

          <Label>Tags (comma separated)</Label>
          <input
            value={form.tags}
            onChange={(e) => set({ tags: e.target.value })}
            placeholder="bestseller, imported"
            className={inputCls + " mb-4"}
          />

          <div className="bg-[#F5EEFB] border border-[#E4D9F5] rounded-[10px] p-3.5 mb-3.5">
            <div className="text-xs font-bold text-[#1A2027] mb-1.5">City Pet House Commission (%) *</div>
            <div className="text-[11px] text-[#5B3B8C] mb-2">
              The percentage City Pet House keeps from this product&apos;s selling price for listing &amp; selling it on your behalf.
            </div>
            <input
              type="number"
              value={form.commissionPct}
              onChange={(e) => set({ commissionPct: e.target.value })}
              placeholder="e.g. 15"
              className={inputCls + " bg-white mb-2.5"}
            />
            <div className="flex justify-between text-xs text-[#5B3B8C]">
              <span>
                Commission to City Pet House: <strong>Rs. {commissionAmount.toLocaleString("en-IN")}</strong>
              </span>
              <span>
                You receive: <strong>Rs. {netPayable.toLocaleString("en-IN")}</strong>
              </span>
            </div>
          </div>

          <ToggleRow label="✨ New Arrival" checked={form.newArrival} onChange={(v) => set({ newArrival: v })} />

          <ToggleRow label="🔥 Hot Sale" checked={form.hotSale} onChange={(v) => set({ hotSale: v })} />
          {form.hotSale && (
            <div className="mb-3.5 -mt-2">
              <Label>Discount %</Label>
              <input type="number" value={form.hotDiscount} onChange={(e) => set({ hotDiscount: e.target.value })} className={inputCls + " mb-1"} />
              <div className="text-[11px] text-[#8A96A3]">
                Sale price shown to customers: <strong style={{ color: "#1F7A4D" }}>Rs. {salePricePreview.toLocaleString("en-IN")}</strong>
              </div>
            </div>
          )}

          <ToggleRow label="⏰ Today's Deal" checked={form.todaysDeal} onChange={(v) => set({ todaysDeal: v })} />
          {form.todaysDeal && (
            <div className="mb-3.5 -mt-2">
              <div className="text-[11px] text-[#8A96A3] mb-2">
                Shows in the Home page &quot;Today&apos;s Deals&quot; section. Optionally set a time window — outside it, the product drops out
                automatically.
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-[10px] font-bold text-[#8A96A3] mb-1">STARTS</div>
                  <input
                    type="datetime-local"
                    value={form.dealStart}
                    onChange={(e) => set({ dealStart: e.target.value })}
                    className="w-full h-[34px] rounded-md border border-[#E4E9EC] px-2 text-xs box-border"
                  />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#8A96A3] mb-1">ENDS</div>
                  <input
                    type="datetime-local"
                    value={form.dealEnd}
                    onChange={(e) => set({ dealEnd: e.target.value })}
                    className="w-full h-[34px] rounded-md border border-[#E4E9EC] px-2 text-xs box-border"
                  />
                </div>
              </div>
            </div>
          )}

          <div
            onClick={() => set({ outOfStock: !form.outOfStock })}
            className="bg-[#F7F9FA] border border-[#E4E9EC] rounded-[10px] p-3.5 mb-3.5 flex items-center justify-between cursor-pointer"
          >
            <div>
              <div className="text-[13px] font-semibold text-[#1A2027]">🚫 Mark as Out of Stock</div>
              <div className="text-[11px] text-[#8A96A3] mt-0.5">No physical inventory tracking — flag this manually.</div>
            </div>
            <Switch checked={form.outOfStock} />
          </div>

          <Label>Status</Label>
          <div className="flex gap-2 bg-[#F0F2F4] rounded-[9px] p-1 mb-4">
            {(["Active", "Draft"] as const).map((s) => (
              <button
                key={s}
                onClick={() => set({ status: s })}
                className="flex-1 text-center py-2 rounded-[7px] text-xs font-semibold cursor-pointer"
                style={{ background: form.status === s ? "#1996C8" : "transparent", color: form.status === s ? "#fff" : "#5B6773" }}
              >
                {s}
              </button>
            ))}
          </div>

          {error && <div className="text-xs text-[#D64545] mb-2.5">{error}</div>}
          <div className="flex gap-2.5">
            <button onClick={submit} className="flex-1 bg-primary text-white text-center py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer">
              Submit for Review
            </button>
            <button
              onClick={() => {
                setOpen(false);
                setForm(EMPTY);
                setError("");
              }}
              className="px-4.5 py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer text-[#5B6773]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {submitted && <div className="text-[11px] text-[#1F7A4D] mb-4 -mt-2.5">✓ Submitted — City Pet House will review this product shortly</div>}

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

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-semibold text-[#1A2027] mb-1.5">{children}</div>;
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <div
      onClick={onClick}
      className="px-4 py-2 rounded-lg text-[13px] font-semibold cursor-pointer"
      style={{
        background: active ? "#EAF4F9" : "#F7F9FA",
        color: active ? "#1996C8" : "#5B6773",
        border: `1px solid ${active ? "#1996C8" : "#E4E9EC"}`,
      }}
    >
      {children}
    </div>
  );
}

function Switch({ checked }: { checked: boolean }) {
  return (
    <div className="w-[38px] h-[22px] rounded-full relative shrink-0 transition-colors" style={{ background: checked ? "#25D366" : "#D8DCE0" }}>
      <span className="absolute top-0.5 w-[18px] h-[18px] bg-white rounded-full transition-all" style={{ left: checked ? "18px" : "2px" }} />
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className="bg-[#F7F9FA] border border-[#E4E9EC] rounded-[10px] p-3.5 mb-2 flex items-center justify-between cursor-pointer"
    >
      <span className="text-[13px] font-semibold text-[#1A2027]">{label}</span>
      <Switch checked={checked} />
    </div>
  );
}
