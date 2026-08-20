"use client";

import { useState } from "react";
import { usePetTag } from "@/context/PetTagContext";
import type { PetTag } from "@/lib/pet-tag-types";

type TagForm = {
  petName: string;
  age: string;
  sex: "Male" | "Female";
  color: string;
  breed: string;
  microchip: string;
  notes: string;
  ownerName: string;
  phone: string;
  altPhone: string;
  address: string;
  mapLink: string;
};

const EMPTY: TagForm = {
  petName: "",
  age: "",
  sex: "Male",
  color: "",
  breed: "",
  microchip: "",
  notes: "",
  ownerName: "",
  phone: "",
  altPhone: "",
  address: "",
  mapLink: "",
};

function downloadPetTagQr(tag: PetTag) {
  const deepLink = `${window.location.origin}/pet-tag-archive?tag=${encodeURIComponent(tag.tagId)}`;
  const url = "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=" + encodeURIComponent(deepLink);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${tag.petName || "pet"}-tag-${tag.tagId}.png`;
  a.target = "_blank";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default function AdminPetTagArchivePage() {
  const { tags, addTag, updateTag, removeTag } = usePetTag();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);

  const filtered = tags.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return p.petName.toLowerCase().includes(q) || p.ownerName.toLowerCase().includes(q) || p.microchip.toLowerCase().includes(q);
  });

  const openAdd = () => {
    setForm(EMPTY);
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (p: PetTag) => {
    setForm({
      petName: p.petName,
      age: p.age,
      sex: p.sex,
      color: p.color,
      breed: p.breed,
      microchip: p.microchip,
      notes: p.notes,
      ownerName: p.ownerName,
      phone: p.phone,
      altPhone: p.altPhone,
      address: p.address,
      mapLink: p.mapLink,
    });
    setEditingId(p.id);
    setFormOpen(true);
  };

  const submit = () => {
    if (!form.petName.trim() || !form.ownerName.trim() || !form.phone.trim()) return;
    if (editingId) updateTag(editingId, form);
    else addTag(form);
    setFormOpen(false);
  };

  if (formOpen) {
    return (
      <div>
        <div onClick={() => setFormOpen(false)} className="text-xs font-semibold text-primary cursor-pointer mb-3.5">
          ← Back to All Pets
        </div>

        <div className="bg-white border border-[#E4E9EC] rounded-xl p-6 mb-4 max-w-[760px]">
          <div className="text-[15px] font-bold text-[#1A2027] mb-4">🐾 Pet Information</div>
          <div className="grid grid-cols-2 gap-4 mb-3.5">
            <Field label="Pet Name *">
              <Input value={form.petName} onChange={(v) => setForm((f) => ({ ...f, petName: v }))} placeholder="e.g. Buddy" />
            </Field>
            <Field label="Age">
              <Input value={form.age} onChange={(v) => setForm((f) => ({ ...f, age: v }))} placeholder="e.g. 4 months" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-3.5">
            <Field label="Sex">
              <select
                value={form.sex}
                onChange={(e) => setForm((f) => ({ ...f, sex: e.target.value as "Male" | "Female" }))}
                className="w-full box-border px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] bg-white"
              >
                <option>Male</option>
                <option>Female</option>
              </select>
            </Field>
            <Field label="Color">
              <Input value={form.color} onChange={(v) => setForm((f) => ({ ...f, color: v }))} placeholder="e.g. Golden" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-3.5">
            <Field label="Breed">
              <Input value={form.breed} onChange={(v) => setForm((f) => ({ ...f, breed: v }))} placeholder="e.g. Labrador" />
            </Field>
            <Field label="Microchip No.">
              <Input value={form.microchip} onChange={(v) => setForm((f) => ({ ...f, microchip: v }))} placeholder="15-digit number" />
            </Field>
          </div>
          <div className="w-[200px] h-[100px] mb-3.5 rounded-lg bg-[#EDEFF1] flex items-center justify-center text-[10px] text-[#8A96A3]">
            Upload photo
          </div>
          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              placeholder="Vaccinations, allergies, special needs…"
              className="w-full box-border rounded-lg border border-[#E4E9EC] px-3 py-2.5 text-[13px] resize-y font-sans"
            />
          </Field>
        </div>

        <div className="bg-white border border-[#E4E9EC] rounded-xl p-6 mb-4 max-w-[760px]">
          <div className="text-[15px] font-bold text-[#1A2027] mb-4">👤 Owner Information</div>
          <div className="grid grid-cols-2 gap-4 mb-3.5">
            <Field label="Owner Name *">
              <Input value={form.ownerName} onChange={(v) => setForm((f) => ({ ...f, ownerName: v }))} placeholder="Full name" />
            </Field>
            <Field label="Phone *">
              <Input value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} placeholder="+977 98XXXXXXXX" />
            </Field>
          </div>
          <div className="mb-3.5 max-w-[340px]">
            <Field label="Alt. Phone">
              <Input value={form.altPhone} onChange={(v) => setForm((f) => ({ ...f, altPhone: v }))} placeholder="Secondary number" />
            </Field>
          </div>
          <div className="mb-3.5">
            <Field label="Address">
              <textarea
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                rows={2}
                placeholder="Street, Tole, Ward, City"
                className="w-full box-border rounded-lg border border-[#E4E9EC] px-3 py-2.5 text-[13px] resize-y font-sans"
              />
            </Field>
          </div>
          <Field label="Google Maps Link">
            <Input value={form.mapLink} onChange={(v) => setForm((f) => ({ ...f, mapLink: v }))} placeholder="https://maps.google.com/?q=…" />
          </Field>
        </div>

        <div className="flex gap-2.5 max-w-[760px]">
          <button onClick={submit} className="flex-1 bg-primary text-white text-center py-3.5 rounded-lg text-sm font-bold cursor-pointer">
            {editingId ? "Save Changes" : "Add Pet"}
          </button>
          {editingId && (
            <button
              onClick={() => {
                removeTag(editingId);
                setFormOpen(false);
              }}
              className="bg-white border border-[#D64545] text-[#D64545] text-center px-5 py-3.5 rounded-lg text-[13px] font-bold cursor-pointer"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <div className="font-heading font-bold text-[19px] text-[#1A2027]">Pet QR Tags</div>
        <button onClick={openAdd} className="border border-primary text-primary text-xs font-semibold px-4 py-2.5 rounded-lg cursor-pointer">
          + Add New Pet
        </button>
      </div>
      <div className="text-xs text-[#5B6773] mb-4">
        QR tags placed on pet collars link back to this record — scanning one shows the pet &amp; owner details on the public Pet Tag Archive page.
      </div>

      <div className="flex items-center gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search pets, owners, microchip…"
          className="flex-1 border border-[#E4E9EC] rounded-lg px-3.5 py-2.5 text-[13px] box-border"
        />
        <div className="text-xs text-[#8A96A3] shrink-0">{filtered.length} pets</div>
      </div>

      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
        <div className="grid grid-cols-[0.6fr_1.4fr_1.4fr_1.6fr_0.6fr_0.8fr_1fr] px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
          <div>Photo</div>
          <div>Pet Name</div>
          <div>Breed / Color</div>
          <div>Owner / Phone</div>
          <div>Scans</div>
          <div>QR</div>
          <div>Actions</div>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center text-xs text-[#8A96A3] py-6">No pets found</div>
        ) : (
          filtered.map((p) => (
            <div key={p.id} className="grid grid-cols-[0.6fr_1.4fr_1.4fr_1.6fr_0.6fr_0.8fr_1fr] px-4 py-3 text-xs items-center border-b border-[#F0F2F4] last:border-0">
              <div className="w-9 h-9 rounded-full bg-[#EEF1F3] flex items-center justify-center">🐾</div>
              <div>
                <div className="font-bold text-[#1A2027]">{p.petName}</div>
                <div className="text-[#8A96A3]">
                  {p.sex} · {p.age}
                </div>
                <div className="text-primary font-semibold">{p.tagId}</div>
              </div>
              <div>
                <div className="text-[#1A2027]">{p.breed}</div>
                <div className="text-[#8A96A3]">{p.color}</div>
              </div>
              <div>
                <div className="text-[#1A2027]">{p.ownerName}</div>
                <div className="text-[#8A96A3]">{p.phone}</div>
              </div>
              <div>{p.scans}</div>
              <div>
                <button onClick={() => downloadPetTagQr(p)} className="border border-primary text-primary text-[11px] font-semibold px-2 py-1 rounded cursor-pointer">
                  ⬇ PNG
                </button>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => openEdit(p)} className="border border-primary text-primary text-[11px] font-semibold px-2.5 py-1 rounded cursor-pointer">
                  Edit
                </button>
                <button onClick={() => removeTag(p.id)} className="border border-[#D64545] text-[#D64545] text-[11px] font-semibold px-2.5 py-1 rounded cursor-pointer">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-bold text-[#8A96A3] mb-1.5">{label}</div>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full box-border px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px]"
    />
  );
}
