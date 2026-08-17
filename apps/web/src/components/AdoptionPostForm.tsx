"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, ApiError } from "@/lib/api";

const FIELDS = [
  { name: "name", label: "Pet name" },
  { name: "breed", label: "Breed" },
  { name: "age", label: "Age" },
  { name: "sex", label: "Sex" },
  { name: "vaccinationStatus", label: "Vaccination status" },
  { name: "address", label: "Location" },
  { name: "contact", label: "Contact number" },
] as const;

export function AdoptionPostForm({ onPosted }: { onPosted: () => void }) {
  const { user, accessToken } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>({});
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="rounded-card border border-border bg-white p-6 text-[13px] text-text-secondary">
        <p className="mb-3">Sign in as a pet owner to post an adoption notice.</p>
        <button
          onClick={() => router.push("/account/signin?next=/adoption")}
          className="rounded-control bg-primary px-4 py-2 font-semibold text-white"
        >
          Pet Owner Sign In
        </button>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch("/adoption-posts", {
        method: "POST",
        accessToken,
        body: { ...form, description },
      });
      setForm({});
      setDescription("");
      onPosted();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not post right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-card border border-border bg-white p-6">
      <h2 className="mb-4 text-[16px] font-semibold text-text-dark">Post an Adoption Notice</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.name} className="flex flex-col gap-1">
            <label htmlFor={`adoption-${f.name}`} className="text-[12px] text-text-secondary">
              {f.label}
            </label>
            <input
              id={`adoption-${f.name}`}
              required
              value={form[f.name] ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
              className="rounded-control border border-border px-3 py-2 text-[13px]"
            />
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-col gap-1">
        <label htmlFor="adoption-description" className="text-[12px] text-text-secondary">
          About this pet
        </label>
        <textarea
          id="adoption-description"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="rounded-control border border-border px-3 py-2 text-[13px]"
        />
      </div>
      {error && <p className="mt-2 text-[12px] text-error">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="mt-4 rounded-control bg-primary px-5 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
      >
        {submitting ? "Posting…" : "Post Notice"}
      </button>
    </form>
  );
}
