"use client";

import Link from "next/link";
import { useState } from "react";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { useDogBreeds } from "@/context/DogBreedContext";
import type { DogBreed } from "@/lib/dog-breed-types";

type BreedForm = Omit<DogBreed, "id">;

const EMPTY: BreedForm = {
  name: "",
  origin: "",
  size: "",
  lifespan: "",
  coat: "",
  temperament: "",
  goodWith: "",
  exercise: "",
  grooming: "",
  description: "",
};

export default function AdminDogBreedArchivePage() {
  const { breeds, addBreed, updateBreed, removeBreed } = useDogBreeds();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BreedForm>(EMPTY);
  const [error, setError] = useState("");

  const openAdd = () => {
    setForm(EMPTY);
    setEditingId(null);
    setError("");
    setFormOpen(true);
  };

  const openEdit = (b: DogBreed) => {
    setForm({
      name: b.name,
      origin: b.origin,
      size: b.size,
      lifespan: b.lifespan,
      coat: b.coat,
      temperament: b.temperament,
      goodWith: b.goodWith,
      exercise: b.exercise,
      grooming: b.grooming,
      description: b.description,
    });
    setEditingId(b.id);
    setError("");
    setFormOpen(true);
  };

  const submit = () => {
    if (!form.name.trim() || !form.size.trim() || !form.description.trim()) {
      setError("Please fill in breed name, size, and description.");
      return;
    }
    if (editingId) updateBreed(editingId, form);
    else addBreed(form);
    setFormOpen(false);
  };

  if (formOpen) {
    return (
      <div className="max-w-[520px]">
        <div onClick={() => setFormOpen(false)} className="text-xs font-semibold text-primary cursor-pointer mb-2.5">
          ← Dog Breed Archive
        </div>
        <div className="font-heading font-bold text-[17px] text-[#1A2027] mb-4">{editingId ? "Edit Breed" : "Add Breed"}</div>

        <div className="bg-white border border-[#E4E9EC] rounded-xl p-5">
          <Label>Photo (recommended 800×600px, 4:3)</Label>
          <ImagePlaceholder label="Upload dog photo" className="w-full h-[100px] rounded-lg mb-3.5" />

          <Label>Breed Name *</Label>
          <Input value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />

          <div className="grid grid-cols-2 gap-2.5 mt-3.5">
            <div>
              <Label>Origin</Label>
              <Input value={form.origin} onChange={(v) => setForm((f) => ({ ...f, origin: v }))} />
            </div>
            <div>
              <Label>Size *</Label>
              <Input value={form.size} onChange={(v) => setForm((f) => ({ ...f, size: v }))} />
            </div>
            <div>
              <Label>Lifespan</Label>
              <Input value={form.lifespan} onChange={(v) => setForm((f) => ({ ...f, lifespan: v }))} />
            </div>
            <div>
              <Label>Coat</Label>
              <Input value={form.coat} onChange={(v) => setForm((f) => ({ ...f, coat: v }))} />
            </div>
            <div>
              <Label>Exercise Needs</Label>
              <Input value={form.exercise} onChange={(v) => setForm((f) => ({ ...f, exercise: v }))} />
            </div>
            <div>
              <Label>Grooming</Label>
              <Input value={form.grooming} onChange={(v) => setForm((f) => ({ ...f, grooming: v }))} />
            </div>
          </div>

          <div className="mt-3.5">
            <Label>Good With</Label>
            <Input value={form.goodWith} onChange={(v) => setForm((f) => ({ ...f, goodWith: v }))} />
          </div>

          <div className="mt-3.5">
            <Label>Temperament</Label>
            <textarea
              value={form.temperament}
              onChange={(e) => setForm((f) => ({ ...f, temperament: e.target.value }))}
              rows={2}
              className="w-full box-border rounded-lg border border-[#E4E9EC] px-3 py-2.5 text-[13px] resize-y font-sans"
            />
          </div>

          <div className="mt-3.5">
            <Label>Description *</Label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full box-border rounded-lg border border-[#E4E9EC] px-3 py-2.5 text-[13px] resize-y font-sans"
            />
          </div>

          {error && <div className="text-xs text-[#D64545] mt-3">{error}</div>}

          <div className="flex gap-2.5 mt-4">
            <button onClick={submit} className="flex-1 bg-primary text-white text-center py-3 rounded-lg text-sm font-bold cursor-pointer">
              {editingId ? "Save Changes" : "Add Breed"}
            </button>
            {editingId && (
              <button
                onClick={() => {
                  removeBreed(editingId);
                  setFormOpen(false);
                }}
                className="bg-white border border-[#D64545] text-[#D64545] text-center px-5 py-3 rounded-lg text-[13px] font-bold cursor-pointer"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/pages" className="text-xs font-semibold text-primary cursor-pointer mb-2.5 inline-block">
        ← Pages
      </Link>
      <div className="flex justify-between items-center mb-[18px]">
        <div>
          <div className="font-heading font-bold text-[19px] text-[#1A2027]">Dog Breed Archive</div>
          <div className="text-[13px] text-[#5B6773] mt-0.5">Manage the breeds shown on the public Dog Breed Archive page.</div>
        </div>
        <button onClick={openAdd} className="bg-primary text-white px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer">
          + Add Breed
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {breeds.map((b) => (
          <div key={b.id} className="border border-[#E4E9EC] rounded-[10px] overflow-hidden bg-white">
            <ImagePlaceholder label="dog photo" className="w-full h-[100px]" />
            <div className="p-3">
              <div className="text-[13px] font-bold text-[#1A2027] mb-0.5">{b.name}</div>
              <div className="text-[11px] text-[#8A96A3] mb-2.5">{b.size}</div>
              <div className="flex gap-2.5 text-[11px] font-semibold">
                <div onClick={() => openEdit(b)} className="text-primary cursor-pointer">
                  Edit
                </div>
                <div onClick={() => removeBreed(b.id)} className="text-[#D64545] cursor-pointer">
                  Remove
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {breeds.length === 0 && <div className="p-5 text-xs text-[#8A96A3] text-center">No breeds yet</div>}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-bold text-[#8A96A3] mb-1.5">{children}</div>;
}

function Input({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full box-border px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px]"
    />
  );
}
