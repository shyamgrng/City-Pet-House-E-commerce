"use client";

import { useState } from "react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import PriceInput from "@/components/PriceInput";
import { brandNames, shopCategories, type Product } from "@/lib/catalog-types";

type Draft = Omit<Product, "id">;

const emptyDraft: Draft = {
  name: "",
  desc: "",
  photo: "",
  category: shopCategories[1],
  brand: brandNames[0],
  price: 0,
  qty: 0,
  badge: "",
  hotSale: false,
  hotDiscount: 0,
  todaysDeal: false,
  outOfStock: false,
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
  const [draft, setDraft] = useState<Draft>(initial ? { ...initial } : emptyDraft);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const canSave = draft.name.trim().length > 0 && draft.price > 0;

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-[460px] max-h-[88vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="text-[15px] font-bold text-[#1A2027]">{initial ? "Edit Product" : "Add Product"}</div>
          <div onClick={onClose} className="text-base text-[#8A96A3] cursor-pointer">✕</div>
        </div>

        <div className="mb-3">
          <ImageUploadField
            value={draft.photo}
            onChange={(v) => set("photo", v)}
            label="product photo"
            hint="Recommended size: 800×800px (square), JPG/WEBP."
            height="h-[140px]"
            maxWidth={800}
            maxHeight={800}
          />
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
              {shopCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Brand</Label>
            <select
              value={draft.brand}
              onChange={(e) => set("brand", e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] box-border bg-white"
            >
              {brandNames.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <div>
            <Label>Selling Price (Rs.) *</Label>
            <PriceInput value={draft.price} onChange={(v) => set("price", v)} className="mb-3" />
          </div>
          <div>
            <Label>Qty in Stock *</Label>
            <Input type="number" value={String(draft.qty)} onChange={(v) => set("qty", Number(v) || 0)} />
          </div>
        </div>

        <Label>Badge</Label>
        <div className="flex gap-2 mb-3">
          {(["", "New", "Sale"] as const).map((b) => (
            <button
              key={b || "none"}
              onClick={() => set("badge", b)}
              className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              style={{
                background: draft.badge === b ? "#1996C8" : "#F0F2F4",
                color: draft.badge === b ? "#fff" : "#5B6773",
              }}
            >
              {b || "None"}
            </button>
          ))}
        </div>

        <ToggleRow
          label="Hot Sale"
          checked={draft.hotSale}
          onChange={(v) => set("hotSale", v)}
        />
        {draft.hotSale && (
          <div className="mb-3">
            <Label>Discount %</Label>
            <Input type="number" value={String(draft.hotDiscount)} onChange={(v) => set("hotDiscount", Number(v) || 0)} />
          </div>
        )}

        <ToggleRow label="Today's Deal (feature on Home)" checked={draft.todaysDeal} onChange={(v) => set("todaysDeal", v)} />
        <ToggleRow label="Out of Stock" checked={draft.outOfStock} onChange={(v) => set("outOfStock", v)} />

        <button
          disabled={!canSave}
          onClick={() => canSave && onSave(draft)}
          className="w-full mt-2 bg-primary text-white font-bold text-sm py-3 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {initial ? "Save Changes" : "Add Product"}
        </button>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-semibold text-[#3A4652] mb-1.5">{children}</div>;
}

function Input({ value, onChange, type = "text" }: { value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-3 box-border"
    />
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#F0F2F4] mb-1 last:border-0">
      <span className="text-[13px] text-[#1A2027]">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className="w-10 h-6 rounded-full relative cursor-pointer transition-colors shrink-0"
        style={{ background: checked ? "#25D366" : "#D8DCE0" }}
      >
        <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all" style={{ left: checked ? "18px" : "2px" }} />
      </button>
    </div>
  );
}
