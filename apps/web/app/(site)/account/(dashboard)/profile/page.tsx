"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";

interface Me {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export default function ProfilePage() {
  const { accessToken } = useAuth();
  const [me, setMe] = useState<Me | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    apiFetch<Me>("/me", { accessToken }).then((data) => {
      setMe(data);
      setName(data.name);
      setPhone(data.phone ?? "");
    });
  }, [accessToken]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await apiFetch("/me", { method: "PATCH", accessToken, body: { name, phone } });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (!me) return <p className="text-[13px] text-text-muted">Loading profile…</p>;

  return (
    <form onSubmit={save} className="max-w-md rounded-card border border-border bg-white p-5">
      <div className="mb-3 flex flex-col gap-1">
        <label className="text-[12px] text-text-secondary">Full name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-control border border-border px-3 py-2 text-[13px]" />
      </div>
      <div className="mb-3 flex flex-col gap-1">
        <label className="text-[12px] text-text-secondary">Email</label>
        <input value={me.email} disabled className="rounded-control border border-border bg-bg-surface px-3 py-2 text-[13px] text-text-muted" />
      </div>
      <div className="mb-4 flex flex-col gap-1">
        <label className="text-[12px] text-text-secondary">Phone</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-control border border-border px-3 py-2 text-[13px]" />
      </div>
      {saved && <p className="mb-3 text-[12px] text-success">Profile updated.</p>}
      <button type="submit" disabled={saving} className="rounded-control bg-primary px-5 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60">
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
