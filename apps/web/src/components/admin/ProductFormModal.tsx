"use client";

import { useState } from "react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import PriceInput from "@/components/PriceInput";
import { useB2BAuth } from "@/context/B2BAuthContext";
import { useBrand } from "@/context/BrandContext";
import { useCategory } from "@/context/CategoryContext";
import { colourOptions, courierPackageSizes, sizeOptions, type Product } from "@/lib/catalog-types";

type Draft = Omit<Product, "id">;

const emptyDraft: Draft = {
  name: "",
  desc: "",
  photo: "",
  photos: [],
  category: "",
  sku: "",
  brand: "",
  price: 0,
  costPrice: 0,
  qty: 0,
  lowStockAlert: 5,
  sizes: [],
  colours: [],
  suppliedBy: "",
  commissionPercent: 15,
  courierPackageSize: "Medium",
  tags: [],
  newArrival: false,
  hotSale: false,
  hotDiscount: 0,
  todaysDeal: false,
  dealStart: "",
  dealEnd: "",
  outOfStock: false,
  status: "active",
};

export default function ProductFormModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: Product | null;
  onClose: () => void;
  onSave: (draft: Draft) => void;
}) {
  const { accounts } = useB2BAuth();
  const { categories } = useCategory();
  const { brands: brandNames } = useBrand();
  const [draft, setDraft] = useState<Draft>(initial ? { ...initial } : { ...emptyDraft, category: categories[0] || "" });
  const [tagsText, setTagsText] = useState(initial ? initial.tags.join(", ") : "");
  const [error, setError] = useState("");
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const toggleInArray = (key: "sizes" | "colours", value: string) => {
    setDraft((d) => ({ ...d, [key]: d[key].includes(value) ? d[key].filter((v) => v !== value) : [...d[key], value] }));
  };

  const profitPerUnit = draft.costPrice > 0 ? draft.price - draft.costPrice : null;
  const commissionAmount = draft.suppliedBy ? Math.round((draft.price * draft.commissionPercent) / 100) : 0;
  const netPayable = draft.suppliedBy ? draft.price - commissionAmount : 0;
  const salePricePreview = draft.hotSale ? Math.round(draft.price * (1 - draft.hotDiscount / 100)) : draft.price;

  const save = () => {
    if (!draft.name.trim() || !draft.category.trim() || draft.price <= 0 || draft.qty <= 0) {
      setError("Please fill in name, category, price, and quantity.");
      return;
    }
    const photos = draft.photos.filter(Boolean);
    onSave({
      ...draft,
      name: draft.name.trim(),
      desc: draft.desc.trim(),
      photos,
      photo: photos[0] || "",
      brand: draft.brand.trim(),
      tags: tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      commissionPercent: draft.suppliedBy ? draft.commissionPercent : 0,
    });
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-[460px] max-h-[88vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="text-[15px] font-bold text-[#1A2027]">{initial ? "Edit Product" : "Add Product"}</div>
          <div onClick={onClose} className="text-base text-[#8A96A3] cursor-pointer">✕</div>
        </div>

        <Label>Product Photos</Label>
        <div className="grid grid-cols-3 gap-2 mb-3.5">
          {[0, 1, 2, 3].map((i) => (
            <ImageUploadField
              key={i}
              value={draft.photos[i] || ""}
              onChange={(v) =>
                setDraft((d) => {
                  const photos = [...d.photos];
                  photos[i] = v;
                  return { ...d, photos };
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
        <Input value={draft.name} onChange={(v) => set("name", v)} />

        <Label>Description</Label>
        <Input value={draft.desc} onChange={(v) => set("desc", v)} />

        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <div>
            <Label>Category *</Label>
            <select
              value={draft.category}
              onChange={(e) => set("category", e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] box-border bg-white"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>SKU / Barcode</Label>
            <Input value={draft.sku} onChange={(v) => set("sku", v)} placeholder="Auto-generated or scan barcode" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-1">
          <div>
            <Label>Selling Price (Rs.) *</Label>
            <PriceInput value={draft.price} onChange={(v) => set("price", v)} />
          </div>
          <div>
            <Label>Buying Price (Rs.)</Label>
            <PriceInput value={draft.costPrice} onChange={(v) => set("costPrice", v)} placeholder="Cost from supplier" />
          </div>
        </div>
        {profitPerUnit !== null && (
          <div className="text-[11px] text-[#8A96A3] mb-3">
            Profit per unit: <strong style={{ color: profitPerUnit >= 0 ? "#1F7A4D" : "#D64545" }}>{formatSigned(profitPerUnit)}</strong>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <div>
            <Label>Qty in Stock *</Label>
            <Input type="number" value={String(draft.qty)} onChange={(v) => set("qty", Number(v) || 0)} />
          </div>
          <div>
            <Label>Low Stock Alert</Label>
            <Input type="number" value={String(draft.lowStockAlert)} onChange={(v) => set("lowStockAlert", Number(v) || 0)} />
          </div>
        </div>

        <Label>Size(s)</Label>
        <div className="flex gap-2 mb-3.5 flex-wrap">
          {sizeOptions.map((sz) => (
            <Chip key={sz} active={draft.sizes.includes(sz)} onClick={() => toggleInArray("sizes", sz)}>
              {sz}
            </Chip>
          ))}
        </div>

        <Label>Colour(s)</Label>
        <div className="flex gap-2.5 mb-3.5 flex-wrap">
          {colourOptions.map((col) => {
            const active = draft.colours.includes(col.name);
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
        <select
          value={draft.brand}
          onChange={(e) => set("brand", e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-3.5 box-border bg-white"
        >
          <option value="">— No brand —</option>
          {brandNames.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <Label>Supplied By</Label>
        <select
          value={draft.suppliedBy}
          onChange={(e) => set("suppliedBy", e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-3.5 box-border bg-white"
        >
          <option value="">— City Pet House (own stock) —</option>
          {accounts.map((a) => (
            <option key={a.b2bId} value={a.companyName}>
              {a.companyName}
            </option>
          ))}
        </select>

        {draft.suppliedBy && (
          <div className="bg-[#F5EEFB] border border-[#E4D9F5] rounded-[10px] p-3.5 mb-3.5">
            <div className="text-xs font-bold text-[#1A2027] mb-1.5">City Pet House Commission (%) *</div>
            <div className="text-[11px] text-[#5B3B8C] mb-2">
              The percentage City Pet House keeps from this product&apos;s selling price for listing &amp; selling it on the supplier&apos;s
              behalf.
            </div>
            <input
              type="number"
              value={draft.commissionPercent}
              onChange={(e) => set("commissionPercent", Number(e.target.value) || 0)}
              placeholder="e.g. 15"
              className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-2.5 box-border bg-white"
            />
            <div className="flex justify-between text-xs text-[#5B3B8C]">
              <span>
                Commission to CPH: <strong>{formatRs(commissionAmount)}</strong>
              </span>
              <span>
                Supplier receives: <strong>{formatRs(netPayable)}</strong>
              </span>
            </div>
          </div>
        )}

        <Label>Courier Package Size</Label>
        <div className="flex gap-2 mb-3.5 flex-wrap">
          {courierPackageSizes.map((cs) => (
            <Chip key={cs} active={draft.courierPackageSize === cs} onClick={() => set("courierPackageSize", cs)}>
              {cs}
            </Chip>
          ))}
        </div>

        <Label>Tags (comma separated)</Label>
        <Input value={tagsText} onChange={setTagsText} placeholder="bestseller, imported" mb="mb-3.5" />

        <ToggleRow label="✨ New Arrival" checked={draft.newArrival} onChange={(v) => set("newArrival", v)} />

        <ToggleRow label="🔥 Hot Sale" checked={draft.hotSale} onChange={(v) => set("hotSale", v)} />
        {draft.hotSale && (
          <div className="mb-3.5 -mt-2">
            <Label>Discount %</Label>
            <Input type="number" value={String(draft.hotDiscount)} onChange={(v) => set("hotDiscount", Number(v) || 0)} mb="mb-1" />
            <div className="text-[11px] text-[#8A96A3]">
              Sale price shown to customers: <strong style={{ color: "#1F7A4D" }}>{formatRs(salePricePreview)}</strong>
            </div>
          </div>
        )}

        <ToggleRow label="⏰ Today's Deal" checked={draft.todaysDeal} onChange={(v) => set("todaysDeal", v)} />
        {draft.todaysDeal && (
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
                  value={draft.dealStart}
                  onChange={(e) => set("dealStart", e.target.value)}
                  className="w-full h-[34px] rounded-md border border-[#E4E9EC] px-2 text-xs box-border"
                />
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#8A96A3] mb-1">ENDS</div>
                <input
                  type="datetime-local"
                  value={draft.dealEnd}
                  onChange={(e) => set("dealEnd", e.target.value)}
                  className="w-full h-[34px] rounded-md border border-[#E4E9EC] px-2 text-xs box-border"
                />
              </div>
            </div>
            <div className="text-[10px] text-[#8A96A3] mt-1.5">Leave blank to show indefinitely while the toggle is on.</div>
          </div>
        )}

        <div
          onClick={() => set("outOfStock", !draft.outOfStock)}
          className="bg-[#F7F9FA] border border-[#E4E9EC] rounded-[10px] p-3.5 mb-3.5 flex items-center justify-between cursor-pointer"
        >
          <div>
            <div className="text-[13px] font-semibold text-[#1A2027]">🚫 Mark as Out of Stock</div>
            <div className="text-[11px] text-[#8A96A3] mt-0.5">No physical inventory tracking — staff flag this manually.</div>
          </div>
          <Switch checked={draft.outOfStock} />
        </div>

        <Label>Status</Label>
        <div className="flex gap-2 bg-[#F0F2F4] rounded-[9px] p-1 mb-4">
          {(["active", "draft"] as const).map((s) => (
            <button
              key={s}
              onClick={() => set("status", s)}
              className="flex-1 text-center py-2 rounded-[7px] text-xs font-semibold cursor-pointer capitalize"
              style={{ background: draft.status === s ? "#1996C8" : "transparent", color: draft.status === s ? "#fff" : "#5B6773" }}
            >
              {s}
            </button>
          ))}
        </div>

        {error && <div className="text-xs text-[#D64545] mb-2.5">{error}</div>}
        <button
          onClick={save}
          className="w-full bg-primary text-white font-bold text-sm py-3 rounded-lg cursor-pointer"
        >
          {initial ? "Save Changes" : "Add Product"}
        </button>
      </div>
    </div>
  );
}

function formatRs(n: number) {
  return "Rs. " + n.toLocaleString("en-IN");
}

function formatSigned(n: number) {
  return (n >= 0 ? "+" : "-") + "Rs. " + Math.abs(n).toLocaleString("en-IN");
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-semibold text-[#3A4652] mb-1.5">{children}</div>;
}

function Input({
  value,
  onChange,
  type = "text",
  placeholder,
  mb = "mb-3",
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  mb?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] ${mb} box-border`}
    />
  );
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
