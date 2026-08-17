"use client";

import { useCallback, useEffect, useState } from "react";
import { formatNPR } from "@cph/shared-types";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { apiFetch, uploadFile, ApiError } from "@/lib/api";

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  brand: string | null;
  price: number;
  qty: number;
  images: string[];
  tags: string[];
  badge: string | null;
  rating: number | null;
  outOfStock: boolean;
  status: string;
}

const EMPTY_FORM = {
  name: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  qty: "",
  tags: "",
  badge: "",
  rating: "",
  status: "ACTIVE",
  image: "",
};

export default function AdminShopPage() {
  const { accessToken } = useAdminAuth();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setProducts(await apiFetch<Product[]>("/admin/products", { accessToken }));
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  function startAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description ?? "",
      category: p.category,
      brand: p.brand ?? "",
      price: String(p.price),
      qty: String(p.qty),
      tags: p.tags.join(", "),
      badge: p.badge ?? "",
      rating: p.rating != null ? String(p.rating) : "",
      status: p.status,
      image: p.images[0] ?? "",
    });
    setShowForm(true);
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { url } = await uploadFile(file);
      setForm((s) => ({ ...s, image: url }));
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
        name: form.name,
        description: form.description.trim() || undefined,
        category: form.category,
        brand: form.brand || undefined,
        price: Number(form.price),
        qty: Number(form.qty || 0),
        images: form.image ? [form.image] : [],
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        badge: form.badge.trim() || undefined,
        rating: form.rating ? Number(form.rating) : undefined,
        status: form.status,
      };
      if (editingId) {
        await apiFetch(`/admin/products/${editingId}`, { method: "PATCH", accessToken, body });
      } else {
        await apiFetch("/admin/products", { method: "POST", accessToken, body });
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save the product.");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this product?")) return;
    await apiFetch(`/admin/products/${id}`, { method: "DELETE", accessToken });
    await load();
  }

  async function toggleOutOfStock(p: Product) {
    await apiFetch(`/admin/products/${p.id}/out-of-stock`, {
      method: "PATCH",
      accessToken,
      body: { outOfStock: !p.outOfStock },
    });
    await load();
  }

  async function toggleStatus(p: Product) {
    await apiFetch(`/admin/products/${p.id}`, {
      method: "PATCH",
      accessToken,
      body: { status: p.status === "ACTIVE" ? "HIDDEN" : "ACTIVE" },
    });
    await load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[22px]">Shop</h1>
        <button onClick={startAdd} className="rounded-control bg-primary px-4 py-2 text-[13px] font-semibold text-white">
          + Add Product
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="mb-6 grid grid-cols-2 gap-3 rounded-card border border-border bg-white p-5">
          <div className="col-span-2 flex gap-4">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-control border border-border bg-bg-surface">
              {form.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-center text-[11px] text-text-muted">No photo</span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="product-photo" className="text-[12px] text-text-secondary">Product photo</label>
              <input id="product-photo" type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} className="text-[12px]" />
              {uploading && <span className="text-[11px] text-text-muted">Uploading…</span>}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="product-name" className="text-[12px] text-text-secondary">Name</label>
            <input
              id="product-name"
              required
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="product-category" className="text-[12px] text-text-secondary">Category</label>
            <input
              id="product-category"
              required
              value={form.category}
              onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="product-brand" className="text-[12px] text-text-secondary">Brand</label>
            <input
              id="product-brand"
              value={form.brand}
              onChange={(e) => setForm((s) => ({ ...s, brand: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="product-badge" className="text-[12px] text-text-secondary">Badge (optional)</label>
            <input
              id="product-badge"
              placeholder="e.g. New, Sale"
              value={form.badge}
              onChange={(e) => setForm((s) => ({ ...s, badge: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="product-price" className="text-[12px] text-text-secondary">Price (Rs.)</label>
            <input
              id="product-price"
              required
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="product-qty" className="text-[12px] text-text-secondary">Stock Qty</label>
            <input
              id="product-qty"
              type="number"
              min={0}
              value={form.qty}
              onChange={(e) => setForm((s) => ({ ...s, qty: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="product-rating" className="text-[12px] text-text-secondary">Rating (0–5, optional)</label>
            <input
              id="product-rating"
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={form.rating}
              onChange={(e) => setForm((s) => ({ ...s, rating: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="product-status" className="text-[12px] text-text-secondary">Visibility</label>
            <select
              id="product-status"
              value={form.status}
              onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            >
              <option value="ACTIVE">Published (visible on shop)</option>
              <option value="HIDDEN">Hidden (draft, not visible)</option>
            </select>
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <label htmlFor="product-tags" className="text-[12px] text-text-secondary">Tags (comma separated, used for search)</label>
            <input
              id="product-tags"
              value={form.tags}
              onChange={(e) => setForm((s) => ({ ...s, tags: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <label htmlFor="product-description" className="text-[12px] text-text-secondary">Description</label>
            <textarea
              id="product-description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
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
              {submitting ? "Saving…" : editingId ? "Save Changes" : "Add Product"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-control border border-border px-4 py-2 text-[13px]">
              Cancel
            </button>
          </div>
        </form>
      )}

      {!products ? (
        <p className="text-[13px] text-text-muted">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-white">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-bg-surface text-left text-[12px] text-text-muted">
                <th className="px-4 py-3">Photo</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Availability</th>
                <th className="px-4 py-3">Visibility</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
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
                  <td className="px-4 py-3 font-medium text-text-dark">{p.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{p.category}</td>
                  <td className="px-4 py-3 text-text-secondary">{p.brand ?? "—"}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatNPR(p.price)}</td>
                  <td className="px-4 py-3 text-text-secondary">{p.qty}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleOutOfStock(p)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        p.outOfStock ? "bg-error/10 text-error" : "bg-success/10 text-success"
                      }`}
                    >
                      {p.outOfStock ? "Out of stock" : "In stock"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(p)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        p.status === "ACTIVE" ? "bg-primary/10 text-primary" : "bg-text-muted/10 text-text-muted"
                      }`}
                    >
                      {p.status === "ACTIVE" ? "Published" : "Hidden"}
                    </button>
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
