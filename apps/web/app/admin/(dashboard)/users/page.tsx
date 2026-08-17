"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { apiFetch, ApiError } from "@/lib/api";

const SECTIONS: { key: string; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "deliveries", label: "Deliveries" },
  { key: "vetconsults", label: "Vet Consults" },
  { key: "shop", label: "Shop" },
  { key: "finance", label: "Finance" },
  { key: "users", label: "Users" },
];

const ROLES = ["Admin", "Manager", "Staff"] as const;

interface StaffAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  permissions: Record<string, boolean>;
}

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  role: "Staff" as (typeof ROLES)[number],
  permissions: Object.fromEntries(SECTIONS.map((s) => [s.key, false])) as Record<string, boolean>,
};

export default function AdminUsersPage() {
  const { admin, accessToken } = useAdminAuth();
  const [accounts, setAccounts] = useState<StaffAccount[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setAccounts(await apiFetch<StaffAccount[]>("/admin/users", { accessToken }));
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch("/admin/users", { method: "POST", accessToken, body: form });
      setForm(EMPTY_FORM);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create the account.");
    } finally {
      setSubmitting(false);
    }
  }

  async function togglePermission(account: StaffAccount, section: string) {
    await apiFetch(`/admin/users/${account.id}`, {
      method: "PATCH",
      accessToken,
      body: { permissions: { [section]: !account.permissions[section] } },
    }).catch((err) => setError(err instanceof ApiError ? err.message : "Could not update permissions."));
    await load();
  }

  async function toggleStatus(account: StaffAccount) {
    const status = account.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    await apiFetch(`/admin/users/${account.id}`, { method: "PATCH", accessToken, body: { status } }).catch((err) =>
      setError(err instanceof ApiError ? err.message : "Could not update this account."),
    );
    await load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[22px]">User Roles &amp; Permissions</h1>
        <button onClick={() => setShowForm((s) => !s)} className="rounded-control bg-primary px-4 py-2 text-[13px] font-semibold text-white">
          + Add Staff Account
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="mb-6 rounded-card border border-border bg-white p-5">
          <div className="mb-3 grid grid-cols-2 gap-3">
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
              <label className="text-[12px] text-text-secondary">Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                className="rounded-control border border-border px-3 py-2 text-[13px]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12px] text-text-secondary">Password</label>
              <input
                required
                type="password"
                minLength={8}
                value={form.password}
                onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                className="rounded-control border border-border px-3 py-2 text-[13px]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12px] text-text-secondary">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm((s) => ({ ...s, role: e.target.value as (typeof ROLES)[number] }))}
                className="rounded-control border border-border px-3 py-2 text-[13px]"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="mb-2 text-[12px] font-medium text-text-secondary">Section access</p>
          <div className="mb-3 flex flex-wrap gap-4">
            {SECTIONS.map((section) => (
              <label key={section.key} className="flex items-center gap-2 text-[13px] text-text-secondary">
                <input
                  type="checkbox"
                  checked={form.permissions[section.key]}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, permissions: { ...s.permissions, [section.key]: e.target.checked } }))
                  }
                />
                {section.label}
              </label>
            ))}
          </div>

          {error && <p className="mb-3 text-[12px] text-error">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-control bg-primary px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "Creating…" : "Create Account"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-control border border-border px-4 py-2 text-[13px]">
              Cancel
            </button>
          </div>
        </form>
      )}

      {!accounts ? (
        <p className="text-[13px] text-text-muted">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-white">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-bg-surface text-left text-[12px] text-text-muted">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                {SECTIONS.map((s) => (
                  <th key={s.key} className="px-3 py-3 text-center">
                    {s.label}
                  </th>
                ))}
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => {
                const isSelf = account.id === admin?.id;
                return (
                  <tr key={account.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-dark">{account.name}</p>
                      <p className="text-[11px] text-text-muted">{account.email}</p>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{account.role}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          account.status === "ACTIVE" ? "bg-success/10 text-success" : "bg-error/10 text-error"
                        }`}
                      >
                        {account.status === "ACTIVE" ? "Active" : "Suspended"}
                      </span>
                    </td>
                    {SECTIONS.map((s) => (
                      <td key={s.key} className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={!!account.permissions[s.key]}
                          disabled={isSelf && s.key === "users"}
                          onChange={() => togglePermission(account, s.key)}
                        />
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleStatus(account)}
                        disabled={isSelf}
                        className="text-[12px] font-medium text-error hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {account.status === "ACTIVE" ? "Suspend" : "Reactivate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
