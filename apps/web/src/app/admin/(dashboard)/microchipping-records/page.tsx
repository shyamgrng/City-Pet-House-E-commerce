"use client";

import { useState } from "react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import MediaSlot from "@/components/MediaSlot";
import PhoneInput from "@/components/PhoneInput";
import { microchipAddress, useMicrochip } from "@/context/MicrochipContext";
import { isValidNepalPhone } from "@/lib/phone";
import type { MicrochipRecord } from "@/lib/microchip-types";

type McForm = Omit<MicrochipRecord, "id">;

const EMPTY: McForm = {
  mcNumber: "",
  ownerName: "",
  wardNo: "",
  municipality: "",
  phone: "",
  altPhone: "",
  houseNo: "",
  district: "",
  provinceNo: "",
  zone: "",
  mapLink: "",
  petName: "",
  photo: "",
  sex: "Male",
  age: "",
  color: "",
  breed: "",
  notes: "",
  vetName: "",
  clinic: "City Pet House & Animal Clinic",
  mcDate: "",
};

export default function MicrochippingRecordsPage() {
  const { records, addRecord, updateRecord, removeRecord } = useMicrochip();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<McForm>(EMPTY);

  const filtered = records.filter((m) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return m.mcNumber.toLowerCase().includes(q) || m.petName.toLowerCase().includes(q) || m.ownerName.toLowerCase().includes(q);
  });

  const openAdd = () => {
    setForm(EMPTY);
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (m: MicrochipRecord) => {
    setForm({
      mcNumber: m.mcNumber,
      ownerName: m.ownerName,
      wardNo: m.wardNo,
      municipality: m.municipality,
      phone: m.phone,
      altPhone: m.altPhone,
      houseNo: m.houseNo,
      district: m.district,
      provinceNo: m.provinceNo,
      zone: m.zone,
      mapLink: m.mapLink,
      petName: m.petName,
      photo: m.photo,
      sex: m.sex,
      age: m.age,
      color: m.color,
      breed: m.breed,
      notes: m.notes,
      vetName: m.vetName,
      clinic: m.clinic,
      mcDate: m.mcDate,
    });
    setEditingId(m.id);
    setFormOpen(true);
  };

  const submit = () => {
    if (!form.mcNumber.trim() || !form.ownerName.trim() || !form.petName.trim() || !isValidNepalPhone(form.phone)) return;
    if (editingId) updateRecord(editingId, form);
    else addRecord(form);
    setFormOpen(false);
  };

  if (formOpen) {
    return (
      <div>
        <div onClick={() => setFormOpen(false)} className="text-xs font-semibold text-[#7A56C8] cursor-pointer mb-3.5">
          ← Back to All Records
        </div>

        <div className="bg-white border border-[#E4E9EC] rounded-xl p-6 mb-4 max-w-[760px]">
          <div className="text-[15px] font-bold text-[#1A2027] mb-4">💠 Micro Chip Number</div>
          <Input value={form.mcNumber} onChange={(v) => setForm((f) => ({ ...f, mcNumber: v }))} placeholder="15-digit chip number" />
        </div>

        <div className="bg-white border border-[#E4E9EC] rounded-xl p-6 mb-4 max-w-[760px]">
          <div className="text-[15px] font-bold text-[#1A2027] mb-4">👤 Owner Information</div>
          <div className="grid grid-cols-2 gap-4 mb-3.5">
            <Field label="Owner's Name *">
              <Input value={form.ownerName} onChange={(v) => setForm((f) => ({ ...f, ownerName: v }))} placeholder="Full name" />
            </Field>
            <Field label="Ward No.">
              <Input value={form.wardNo} onChange={(v) => setForm((f) => ({ ...f, wardNo: v }))} placeholder="e.g. 6" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-3.5">
            <Field label="Municipality">
              <Input value={form.municipality} onChange={(v) => setForm((f) => ({ ...f, municipality: v }))} placeholder="e.g. Gokarneshwor" />
            </Field>
            <Field label="Phone No. *">
              <PhoneInput value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} className="" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-3.5">
            <Field label="Alt. Phone No.">
              <PhoneInput value={form.altPhone} onChange={(v) => setForm((f) => ({ ...f, altPhone: v }))} className="" />
            </Field>
            <Field label="House No.">
              <Input value={form.houseNo} onChange={(v) => setForm((f) => ({ ...f, houseNo: v }))} placeholder="e.g. 12" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-3.5">
            <Field label="District">
              <Input value={form.district} onChange={(v) => setForm((f) => ({ ...f, district: v }))} placeholder="e.g. Kathmandu" />
            </Field>
            <Field label="Province No.">
              <Input value={form.provinceNo} onChange={(v) => setForm((f) => ({ ...f, provinceNo: v }))} placeholder="e.g. Bagmati" />
            </Field>
          </div>
          <div className="mb-3.5 max-w-[340px]">
            <Field label="Zone">
              <Input value={form.zone} onChange={(v) => setForm((f) => ({ ...f, zone: v }))} placeholder="e.g. Bagmati Zone" />
            </Field>
          </div>
          <Field label="Google Maps Link">
            <Input value={form.mapLink} onChange={(v) => setForm((f) => ({ ...f, mapLink: v }))} placeholder="https://maps.google.com/?q=…" />
          </Field>
        </div>

        <div className="bg-white border border-[#E4E9EC] rounded-xl p-6 mb-4 max-w-[760px]">
          <div className="text-[15px] font-bold text-[#1A2027] mb-4">🐾 Dog / Cat Information</div>
          <div className="grid grid-cols-2 gap-4 mb-3.5">
            <Field label="Dog/Cat Name *">
              <Input value={form.petName} onChange={(v) => setForm((f) => ({ ...f, petName: v }))} placeholder="e.g. Buddy" />
            </Field>
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
          </div>
          <div className="grid grid-cols-2 gap-4 mb-3.5">
            <Field label="Age">
              <Input value={form.age} onChange={(v) => setForm((f) => ({ ...f, age: v }))} placeholder="e.g. 4 months" />
            </Field>
            <Field label="Colour">
              <Input value={form.color} onChange={(v) => setForm((f) => ({ ...f, color: v }))} placeholder="e.g. Golden" />
            </Field>
          </div>
          <div className="mb-3.5 max-w-[340px]">
            <Field label="Breed">
              <Input value={form.breed} onChange={(v) => setForm((f) => ({ ...f, breed: v }))} placeholder="e.g. Labrador" />
            </Field>
          </div>
          <div className="w-[200px] mb-3.5">
            <ImageUploadField
              value={form.photo}
              onChange={(v) => setForm((f) => ({ ...f, photo: v }))}
              label="pet photo"
              height="h-[100px]"
              maxWidth={600}
              maxHeight={600}
            />
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
          <div className="text-[15px] font-bold text-[#1A2027] mb-4">🩺 Veterinarian Declaration</div>
          <div className="text-xs text-[#5B6773] mb-3.5">
            I declare that I have inserted a microchip with the listed chip number in this dog/cat for identification purposes.
          </div>
          <div className="grid grid-cols-2 gap-4 mb-3.5">
            <Field label="Veterinarian Name">
              <Input value={form.vetName} onChange={(v) => setForm((f) => ({ ...f, vetName: v }))} placeholder="Dr. …" />
            </Field>
            <Field label="Clinic">
              <Input value={form.clinic} onChange={(v) => setForm((f) => ({ ...f, clinic: v }))} placeholder="City Pet House & Animal Clinic" />
            </Field>
          </div>
          <div className="max-w-[340px]">
            <Field label="Date">
              <Input value={form.mcDate} onChange={(v) => setForm((f) => ({ ...f, mcDate: v }))} placeholder="DD/MM/YYYY" />
            </Field>
          </div>
        </div>

        <div className="flex gap-2.5 max-w-[760px]">
          <button onClick={submit} className="flex-1 bg-[#7A56C8] text-white text-center py-3.5 rounded-lg text-sm font-bold cursor-pointer">
            {editingId ? "Save & Update" : "Save Chip Record"}
          </button>
          {editingId && (
            <button
              onClick={() => {
                removeRecord(editingId);
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
      <div className="flex justify-between items-start mb-1">
        <div className="font-heading font-bold text-[19px] text-[#1A2027]">Microchipping Records</div>
        <button onClick={openAdd} className="border border-[#7A56C8] text-[#7A56C8] text-xs font-semibold px-4 py-2.5 rounded-lg cursor-pointer">
          + Add New Chip
        </button>
      </div>
      <div className="text-xs text-[#5B6773] mb-4">
        Records entered here are matched when an authorized user looks up a microchip number on the public Microchipping Archive page.
      </div>

      <div className="flex items-center gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search chip number, pet name, owner…"
          className="flex-1 border border-[#E4E9EC] rounded-lg px-3.5 py-2.5 text-[13px] box-border"
        />
        <div className="text-xs text-[#8A96A3] shrink-0">{filtered.length} chipped animals</div>
      </div>

      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
        <div className="grid grid-cols-[0.6fr_1.6fr_1.4fr_1.6fr_1.4fr_1fr] px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
          <div>Photo</div>
          <div>Chip No. / Pet</div>
          <div>Breed / Color</div>
          <div>Owner / Phone</div>
          <div>Location</div>
          <div>Actions</div>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center text-xs text-[#8A96A3] py-6">No microchipped animals found</div>
        ) : (
          filtered.map((m) => (
            <div key={m.id} className="grid grid-cols-[0.6fr_1.6fr_1.4fr_1.6fr_1.4fr_1fr] px-4 py-3 text-xs items-center border-b border-[#F0F2F4] last:border-0">
              {m.photo ? (
                <MediaSlot src={m.photo} label="pet photo" shape="circle" className="w-9 h-9" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#EEF1F3] flex items-center justify-center">🐾</div>
              )}
              <div>
                <div className="font-bold text-[#7A56C8]">{m.mcNumber}</div>
                <div className="text-[#8A96A3]">
                  {m.petName} · {m.sex}, {m.age}
                </div>
              </div>
              <div>
                <div className="text-[#1A2027]">{m.breed}</div>
                <div className="text-[#8A96A3]">{m.color}</div>
              </div>
              <div>
                <div className="text-[#1A2027]">{m.ownerName}</div>
                <div className="text-[#8A96A3]">{m.phone}</div>
              </div>
              <div className="text-[#3A4652] text-[11px]">{microchipAddress(m)}</div>
              <div className="flex gap-1.5">
                <button onClick={() => openEdit(m)} className="border border-[#7A56C8] text-[#7A56C8] text-[11px] font-semibold px-2.5 py-1 rounded cursor-pointer">
                  Edit
                </button>
                <button onClick={() => removeRecord(m.id)} className="border border-[#D64545] text-[#D64545] text-[11px] font-semibold px-2.5 py-1 rounded cursor-pointer">
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
