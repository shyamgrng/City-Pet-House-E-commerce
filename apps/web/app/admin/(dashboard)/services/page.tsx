"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { apiFetch, uploadFile, ApiError } from "@/lib/api";

interface Service {
  id: string;
  name: string;
  shortDesc: string;
  seoTitle: string;
  longDesc: string;
  benefits: string[];
  duration: string | null;
  price: string | null;
  schedule: { age: string; vaccine: string }[] | null;
  photo: string | null;
  status: string;
  order: number;
}

const EMPTY_FORM = {
  name: "",
  shortDesc: "",
  seoTitle: "",
  longDesc: "",
  benefits: "",
  duration: "",
  price: "",
  schedule: "",
  status: "ACTIVE",
  order: "0",
  photo: "",
};

function parseSchedule(text: string): { age: string; vaccine: string }[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [age, ...rest] = line.split("|");
      return { age: (age ?? "").trim(), vaccine: rest.join("|").trim() };
    })
    .filter((row) => row.age && row.vaccine);
}

function formatSchedule(rows: { age: string; vaccine: string }[] | null): string {
  return (rows ?? []).map((r) => `${r.age} | ${r.vaccine}`).join("\n");
}

export default function AdminServicesPage() {
  const { accessToken } = useAdminAuth();
  const [services, setServices] = useState<Service[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setServices(await apiFetch<Service[]>("/admin/services", { accessToken }));
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  function startAdd() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, order: String((services?.length ?? 0) * 10) });
    setShowForm(true);
  }

  function startEdit(s: Service) {
    setEditingId(s.id);
    setForm({
      name: s.name,
      shortDesc: s.shortDesc,
      seoTitle: s.seoTitle,
      longDesc: s.longDesc,
      benefits: s.benefits.join("\n"),
      duration: s.duration ?? "",
      price: s.price ?? "",
      schedule: formatSchedule(s.schedule),
      status: s.status,
      order: String(s.order),
      photo: s.photo ?? "",
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
        name: form.name,
        shortDesc: form.shortDesc,
        seoTitle: form.seoTitle,
        longDesc: form.longDesc,
        benefits: form.benefits
          .split("\n")
          .map((b) => b.trim())
          .filter(Boolean),
        duration: form.duration.trim() || undefined,
        price: form.price.trim() || undefined,
        schedule: parseSchedule(form.schedule),
        status: form.status,
        order: Number(form.order || 0),
        photo: form.photo || undefined,
      };
      if (editingId) {
        await apiFetch(`/admin/services/${editingId}`, { method: "PATCH", accessToken, body });
      } else {
        await apiFetch("/admin/services", { method: "POST", accessToken, body });
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save the service.");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this service?")) return;
    await apiFetch(`/admin/services/${id}`, { method: "DELETE", accessToken });
    await load();
  }

  async function toggleStatus(s: Service) {
    await apiFetch(`/admin/services/${s.id}`, {
      method: "PATCH",
      accessToken,
      body: { status: s.status === "ACTIVE" ? "HIDDEN" : "ACTIVE" },
    });
    await load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[22px]">Services</h1>
        <button onClick={startAdd} className="rounded-control bg-primary px-4 py-2 text-[13px] font-semibold text-white">
          + Add Service
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
              <label htmlFor="service-photo" className="text-[12px] text-text-secondary">Service photo</label>
              <input id="service-photo" type="file" accept="image/*" onChange={handlePhotoChange} disabled={uploading} className="text-[12px]" />
              {uploading && <span className="text-[11px] text-text-muted">Uploading…</span>}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="svc-name" className="text-[12px] text-text-secondary">Name</label>
            <input
              id="svc-name"
              required
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="svc-order" className="text-[12px] text-text-secondary">Display order (lower first)</label>
            <input
              id="svc-order"
              type="number"
              value={form.order}
              onChange={(e) => setForm((s) => ({ ...s, order: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1">
            <label htmlFor="svc-short" className="text-[12px] text-text-secondary">Short description (shown on the Services grid card)</label>
            <input
              id="svc-short"
              required
              value={form.shortDesc}
              onChange={(e) => setForm((s) => ({ ...s, shortDesc: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1">
            <label htmlFor="svc-seo" className="text-[12px] text-text-secondary">Page title (shown as the detail page heading)</label>
            <input
              id="svc-seo"
              required
              value={form.seoTitle}
              onChange={(e) => setForm((s) => ({ ...s, seoTitle: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1">
            <label htmlFor="svc-long" className="text-[12px] text-text-secondary">Full description</label>
            <textarea
              id="svc-long"
              required
              rows={3}
              value={form.longDesc}
              onChange={(e) => setForm((s) => ({ ...s, longDesc: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="svc-duration" className="text-[12px] text-text-secondary">Duration (optional)</label>
            <input
              id="svc-duration"
              placeholder="e.g. 30 mins"
              value={form.duration}
              onChange={(e) => setForm((s) => ({ ...s, duration: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="svc-price" className="text-[12px] text-text-secondary">Price (optional, free text)</label>
            <input
              id="svc-price"
              placeholder="e.g. From Rs. 700"
              value={form.price}
              onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="svc-status" className="text-[12px] text-text-secondary">Visibility</label>
            <select
              id="svc-status"
              value={form.status}
              onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            >
              <option value="ACTIVE">Published (visible on site)</option>
              <option value="HIDDEN">Hidden (draft, not visible)</option>
            </select>
          </div>

          <div className="col-span-2 flex flex-col gap-1">
            <label htmlFor="svc-benefits" className="text-[12px] text-text-secondary">
              Benefits (&ldquo;Why Choose This Service&rdquo; — one per line)
            </label>
            <textarea
              id="svc-benefits"
              rows={4}
              value={form.benefits}
              onChange={(e) => setForm((s) => ({ ...s, benefits: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1">
            <label htmlFor="svc-schedule" className="text-[12px] text-text-secondary">
              Vaccination schedule (optional — one row per line, format: <code>age | vaccine</code>)
            </label>
            <textarea
              id="svc-schedule"
              rows={4}
              placeholder={"6–8 weeks | DHPPi (1st dose)\n10–12 weeks | DHPPi (2nd dose) + Leptospirosis"}
              value={form.schedule}
              onChange={(e) => setForm((s) => ({ ...s, schedule: e.target.value }))}
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
              {submitting ? "Saving…" : editingId ? "Save Changes" : "Add Service"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-control border border-border px-4 py-2 text-[13px]">
              Cancel
            </button>
          </div>
        </form>
      )}

      {!services ? (
        <p className="text-[13px] text-text-muted">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-white">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-bg-surface text-left text-[12px] text-text-muted">
                <th className="px-4 py-3">Photo</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Visibility</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-control bg-bg-surface">
                      {s.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.photo} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[9px] text-text-muted">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-text-dark">{s.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{s.duration ?? "—"}</td>
                  <td className="px-4 py-3 text-text-secondary">{s.price ?? "—"}</td>
                  <td className="px-4 py-3 text-text-secondary">{s.order}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(s)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        s.status === "ACTIVE" ? "bg-primary/10 text-primary" : "bg-text-muted/10 text-text-muted"
                      }`}
                    >
                      {s.status === "ACTIVE" ? "Published" : "Hidden"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => startEdit(s)} className="mr-3 text-[12px] font-medium text-primary hover:underline">
                      Edit
                    </button>
                    <button onClick={() => remove(s.id)} className="text-[12px] font-medium text-error hover:underline">
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
