"use client";

import { useCallback, useEffect, useState } from "react";
import { formatNPR } from "@cph/shared-types";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { apiFetch, uploadFile, ApiError } from "@/lib/api";

interface PetListing {
  id: string;
  breed: string;
  species: string;
  sex: string;
  age: string;
  price: number;
  deliveryFee: number;
  images: string[];
  tags: string[];
  status: string;
}

const SPECIES_OPTIONS = ["Dog", "Cat", "Small Pets", "Birds", "Fish"];

const EMPTY_FORM = {
  breed: "",
  species: "Dog",
  sex: "",
  age: "",
  price: "",
  deliveryFee: "",
  tags: "",
  status: "AVAILABLE",
  photo: "",
};

export default function AdminPetsPage() {
  const { accessToken } = useAdminAuth();
  const [pets, setPets] = useState<PetListing[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setPets(await apiFetch<PetListing[]>("/admin/pets", { accessToken }));
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  function startAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function startEdit(p: PetListing) {
    setEditingId(p.id);
    setForm({
      breed: p.breed,
      species: p.species,
      sex: p.sex,
      age: p.age,
      price: String(p.price),
      deliveryFee: String(p.deliveryFee),
      tags: p.tags.join(", "),
      status: p.status,
      photo: p.images[0] ?? "",
    });
    setShowForm(true);
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { url } = await uploadFile(file);
      setForm((s) => ({ ...s, photo: url }));
    } catch {
      setError("Could not upload the photo — please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const body = {
        breed: form.breed,
        species: form.species,
        sex: form.sex,
        age: form.age,
        price: Number(form.price),
        deliveryFee: Number(form.deliveryFee || 0),
        images: form.photo ? [form.photo] : [],
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        status: form.status,
      };
      if (editingId) {
        await apiFetch(`/admin/pets/${editingId}`, { method: "PATCH", accessToken, body });
      } else {
        await apiFetch("/admin/pets", { method: "POST", accessToken, body });
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save the pet listing.");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this pet listing?")) return;
    await apiFetch(`/admin/pets/${id}`, { method: "DELETE", accessToken });
    await load();
  }

  async function setStatus(p: PetListing, status: string) {
    await apiFetch(`/admin/pets/${p.id}`, { method: "PATCH", accessToken, body: { status } });
    await load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[22px]">Pets Available</h1>
        <button onClick={startAdd} className="rounded-control bg-primary px-4 py-2 text-[13px] font-semibold text-white">
          + Add Pet
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="mb-6 grid grid-cols-2 gap-3 rounded-card border border-border bg-white p-5">
          <div className="col-span-2 flex gap-4">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-control border border-border bg-bg-surface">
              {form.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.photo} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-center text-[11px] text-text-muted">No photo</span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="pet-photo" className="text-[12px] text-text-secondary">Pet photo</label>
              <input id="pet-photo" type="file" accept="image/*" onChange={handlePhotoChange} disabled={uploading} className="text-[12px]" />
              {uploading && <span className="text-[11px] text-text-muted">Uploading…</span>}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="pet-breed" className="text-[12px] text-text-secondary">Breed</label>
            <input
              id="pet-breed"
              required
              value={form.breed}
              onChange={(e) => setForm((s) => ({ ...s, breed: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="pet-species" className="text-[12px] text-text-secondary">Species</label>
            <select
              id="pet-species"
              value={form.species}
              onChange={(e) => setForm((s) => ({ ...s, species: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            >
              {SPECIES_OPTIONS.map((sp) => (
                <option key={sp} value={sp}>
                  {sp}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="pet-sex" className="text-[12px] text-text-secondary">Sex</label>
            <input
              id="pet-sex"
              required
              placeholder="e.g. Male, Female, Pair, —"
              value={form.sex}
              onChange={(e) => setForm((s) => ({ ...s, sex: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="pet-age" className="text-[12px] text-text-secondary">Age</label>
            <input
              id="pet-age"
              required
              placeholder="e.g. 8 wks, 3 months"
              value={form.age}
              onChange={(e) => setForm((s) => ({ ...s, age: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="pet-price" className="text-[12px] text-text-secondary">Price (Rs.)</label>
            <input
              id="pet-price"
              required
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="pet-delivery" className="text-[12px] text-text-secondary">Delivery fee (Rs.)</label>
            <input
              id="pet-delivery"
              type="number"
              min={0}
              value={form.deliveryFee}
              onChange={(e) => setForm((s) => ({ ...s, deliveryFee: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="pet-status" className="text-[12px] text-text-secondary">Status</label>
            <select
              id="pet-status"
              value={form.status}
              onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            >
              <option value="AVAILABLE">Available (visible on site)</option>
              <option value="RESERVED">Reserved (hidden from listings)</option>
              <option value="SOLD">Sold (hidden from listings)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="pet-tags" className="text-[12px] text-text-secondary">Tags (comma separated)</label>
            <input
              id="pet-tags"
              placeholder="e.g. Vaccinated, Dewormed"
              value={form.tags}
              onChange={(e) => setForm((s) => ({ ...s, tags: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>

          {error && <p className="col-span-2 text-[12px] text-error">{error}</p>}
          <div className="col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={submitting || uploading}
              className="rounded-control bg-primary px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "Saving…" : editingId ? "Save Changes" : "Add Pet"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-control border border-border px-4 py-2 text-[13px]">
              Cancel
            </button>
          </div>
        </form>
      )}

      {!pets ? (
        <p className="text-[13px] text-text-muted">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-white">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-bg-surface text-left text-[12px] text-text-muted">
                <th className="px-4 py-3">Photo</th>
                <th className="px-4 py-3">Breed</th>
                <th className="px-4 py-3">Species</th>
                <th className="px-4 py-3">Sex / Age</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {pets.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-control bg-bg-surface">
                      {p.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[9px] text-text-muted">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-text-dark">{p.breed}</td>
                  <td className="px-4 py-3 text-text-secondary">{p.species}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {p.sex} &middot; {p.age}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{formatNPR(p.price)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={p.status}
                      onChange={(e) => setStatus(p, e.target.value)}
                      className={`rounded-full border-0 px-2.5 py-1 text-[11px] font-semibold ${
                        p.status === "AVAILABLE"
                          ? "bg-success/10 text-success"
                          : p.status === "RESERVED"
                            ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                            : "bg-text-muted/10 text-text-muted"
                      }`}
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="RESERVED">Reserved</option>
                      <option value="SOLD">Sold</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => startEdit(p)} className="mr-3 text-[12px] font-medium text-primary hover:underline">
                      Edit
                    </button>
                    <button onClick={() => remove(p.id)} className="text-[12px] font-medium text-error hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
