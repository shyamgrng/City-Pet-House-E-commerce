"use client";

import { useState } from "react";
import type { AdoptionPost } from "@/lib/adoption-types";

type Draft = Omit<AdoptionPost, "id">;

const emptyDraft: Draft = {
  name: "",
  breed: "",
  age: "",
  sex: "Male",
  vaccination: "",
  address: "",
  desc: "",
  contact: "",
  postedDaysAgo: 0,
  adopted: false,
};

export default function AdoptionFormModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: AdoptionPost | null;
  onClose: () => void;
  onSave: (draft: Draft) => void;
}) {
  const [draft, setDraft] = useState<Draft>(initial ? { ...initial } : emptyDraft);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const canSave = draft.name.trim().length > 0 && draft.breed.trim().length > 0;

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-[460px] max-h-[88vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="text-[15px] font-bold text-[#1A2027]">{initial ? "Edit Adoption Notice" : "Add Adoption Notice"}</div>
          <div onClick={onClose} className="text-base text-[#8A96A3] cursor-pointer">✕</div>
        </div>

        <Label>Dog&apos;s Name *</Label>
        <Input value={draft.name} onChange={(v) => set("name", v)} />

        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <div>
            <Label>Breed *</Label>
            <Input value={draft.breed} onChange={(v) => set("breed", v)} />
          </div>
          <div>
            <Label>Age</Label>
            <Input value={draft.age} onChange={(v) => set("age", v)} />
          </div>
        </div>

        <Label>Sex</Label>
        <div className="flex gap-2 mb-3">
          {["Male", "Female"].map((s) => (
            <button
              key={s}
              onClick={() => set("sex", s)}
              className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              style={{ background: draft.sex === s ? "#1996C8" : "#F0F2F4", color: draft.sex === s ? "#fff" : "#5B6773" }}
            >
              {s}
            </button>
          ))}
        </div>

        <Label>Vaccination</Label>
        <Input value={draft.vaccination} onChange={(v) => set("vaccination", v)} />

        <Label>Description</Label>
        <Input value={draft.desc} onChange={(v) => set("desc", v)} />

        <Label>Contact Number</Label>
        <Input value={draft.contact} onChange={(v) => set("contact", v)} />

        <Label>Address</Label>
        <Input value={draft.address} onChange={(v) => set("address", v)} />

        <Label>Posted Days Ago</Label>
        <Input type="number" value={String(draft.postedDaysAgo)} onChange={(v) => set("postedDaysAgo", Number(v) || 0)} />

        <div className="flex items-center justify-between py-2.5 border-t border-[#F0F2F4] mt-1 mb-4">
          <span className="text-[13px] text-[#1A2027]">Adopted</span>
          <button
            onClick={() => set("adopted", !draft.adopted)}
            className="w-10 h-6 rounded-full relative cursor-pointer transition-colors shrink-0"
            style={{ background: draft.adopted ? "#25D366" : "#D8DCE0" }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all"
              style={{ left: draft.adopted ? "18px" : "2px" }}
            />
          </button>
        </div>

        <button
          disabled={!canSave}
          onClick={() => canSave && onSave(draft)}
          className="w-full mt-2 bg-primary text-white font-bold text-sm py-3 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {initial ? "Save Changes" : "Add Notice"}
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
