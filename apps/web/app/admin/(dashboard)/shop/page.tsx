"use client";

import { useCallback, useEffect, useState } from "react";
import { formatNPR } from "@cph/shared-types";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { apiFetch, ApiError } from "@/lib/api";

interface Product {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  price: number;
  qty: number;
  outOfStock: boolean;
  status: string;
}

const EMPTY_FORM = { name: "", category: "", brand: "", price: "", qty: "" };

export default function AdminShopPage() {
  const { accessToken } = useAdminAuth();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    setForm({ name: p.name, category: p.category, brand: p.brand ?? "", price: String(p.price), qty: String(p.qty) });
    setShowForm(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const body = {
        name: form.name,
        category: form.category,
        brand: form.brand || undefined,
        price: Number(form.price),
        qty: Number(form.qty || 0),
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
          <div className="flex flex-col gap-1">
            <label className="text-[12px] text-text-secondary">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] text-text-secondary">Category</label>
            <input
              required
              value={form.category}
              onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] text-text-secondary">Brand</label>
            <input
              value={form.brand}
              onChange={(e) => setForm((s) => ({ ...s, brand: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] text-text-secondary">Price (Rs.)</label>
            <input
              required
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] text-text-secondary">Stock Qty</label>
            <input
              type="number"
              min={0}
              value={form.qty}
              onChange={(e) => setForm((s) => ({ ...s, qty: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          {error && <p className="col-span-2 text-[12px] text-error">{error}</p>}
          <div className="col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={submitting}
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
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
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
