"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { apiFetch, ApiError } from "@/lib/api";

interface Customer {
  id: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: string;
  name: string;
  orderCount: number;
}

export default function AdminCustomersPage() {
  const { accessToken } = useAdminAuth();
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    if (!accessToken) return;
    setCustomers(await apiFetch<Customer[]>("/admin/pet-owners", { accessToken }));
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleStatus(c: Customer) {
    setBusyId(c.id);
    setError(null);
    try {
      await apiFetch(`/admin/pet-owners/${c.id}`, {
        method: "PATCH",
        accessToken,
        body: { status: c.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" },
      });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That action failed.");
    } finally {
      setBusyId(null);
    }
  }

  const filtered = customers?.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.phone ?? "").includes(q);
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[22px]">Customers</h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone…"
          className="w-72 rounded-control border border-border px-3 py-2 text-[13px]"
        />
      </div>
      {error && <p className="mb-4 text-[13px] text-error">{error}</p>}

      {!customers ? (
        <p className="text-[13px] text-text-muted">Loading…</p>
      ) : filtered!.length === 0 ? (
        <p className="text-[13px] text-text-muted">No customers found.</p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-white">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-bg-surface text-left text-[12px] text-text-muted">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Account</th>
              </tr>
            </thead>
            <tbody>
              {filtered!.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-text-dark">{c.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{c.email}</td>
                  <td className="px-4 py-3 text-text-secondary">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-text-secondary">{c.orderCount}</td>
                  <td className="px-4 py-3 text-text-muted">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(c)}
                      disabled={busyId === c.id}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        c.status === "ACTIVE" ? "bg-success/10 text-success" : "bg-error/10 text-error"
                      }`}
                    >
                      {c.status === "ACTIVE" ? "Active" : "Suspended"}
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
