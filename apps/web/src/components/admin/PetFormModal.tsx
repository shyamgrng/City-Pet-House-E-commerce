"use client";

import { useState } from "react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import PriceInput from "@/components/PriceInput";
import { petSpeciesList, type Pet, type PetStatus } from "@/lib/pet-types";

type Draft = Omit<Pet, "id">;

const emptyDraft: Draft = {
  breed: "",
  species: petSpeciesList[0],
  sex: "Male",
  age: "",
  price: 0,
  deliveryFee: 0,
  tags: [],
  status: "Available",
  photo: "",
  videos: 0,
};

const availableTags = ["Vaccinated", "Dewormed", "Vet Checked"];
const statuses: PetStatus[] = ["Available", "Reserved", "Sold"];

export default function PetFormModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: Pet | null;
  onClose: () => void;
  onSave: (draft: Draft) => void;
}) {
  const [draft, setDraft] = useState<Draft>(initial ? { ...initial } : emptyDraft);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const toggleTag = (tag: string) => {
    set("tags", draft.tags.includes(tag) ? draft.tags.filter((t) => t !== tag) : [...draft.tags, tag]);
  };

  const canSave = draft.breed.trim().length > 0 && draft.price > 0;

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-[460px] max-h-[88vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="text-[15px] font-bold text-[#1A2027]">{initial ? "Edit Pet" : "Add Pet"}</div>
          <div onClick={onClose} className="text-base text-[#8A96A3] cursor-pointer">✕</div>
        </div>

        <Label>Breed / Name *</Label>
        <Input value={draft.breed} onChange={(v) => set("breed", v)} />

        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <div>
            <Label>Species *</Label>
            <select
              value={draft.species}
              onChange={(e) => set("species", e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] box-border bg-white"
            >
              {petSpeciesList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Sex</Label>
            <select
              value={draft.sex}
              onChange={(e) => set("sex", e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] box-border bg-white"
            >
              {["Male", "Female", "Pair", "—"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Label>Age (e.g. &quot;8 wks&quot;, &quot;3 months&quot;)</Label>
        <Input value={draft.age} onChange={(v) => set("age", v)} />

        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <div>
            <Label>Price (Rs.) *</Label>
            <PriceInput value={draft.price} onChange={(v) => set("price", v)} className="mb-3" />
          </div>
          <div>
            <Label>Delivery Fee (Rs.)</Label>
            <PriceInput value={draft.deliveryFee} onChange={(v) => set("deliveryFee", v)} className="mb-3" />
          </div>
        </div>

        <div className="mb-3">
          <ImageUploadField
            value={draft.photo}
            onChange={(v) => set("photo", v)}
            label="pet photo"
            hint="Recommended size: 800×800px (square), JPG/WEBP."
            height="h-[140px]"
            maxWidth={800}
            maxHeight={800}
          />
        </div>
        <Label>Video Count</Label>
        <div className="text-[11px] text-[#8A96A3] mb-1.5">Shown as a 🎥 count on the listing — video files aren&apos;t uploaded/stored.</div>
        <Input type="number" value={String(draft.videos)} onChange={(v) => set("videos", Number(v) || 0)} />

        <Label>Tags</Label>
        <div className="flex gap-2 mb-3 flex-wrap">
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer"
              style={{
                background: draft.tags.includes(tag) ? "#E6F3EC" : "#F0F2F4",
                color: draft.tags.includes(tag) ? "#1F7A4D" : "#5B6773",
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        <Label>Status</Label>
        <div className="flex gap-2 mb-4">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => set("status", s)}
              className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              style={{ background: draft.status === s ? "#1996C8" : "#F0F2F4", color: draft.status === s ? "#fff" : "#5B6773" }}
            >
              {s}
            </button>
          ))}
        </div>

        <button
          disabled={!canSave}
          onClick={() => canSave && onSave(draft)}
          className="w-full mt-2 bg-primary text-white font-bold text-sm py-3 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {initial ? "Save Changes" : "Add Pet"}
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
