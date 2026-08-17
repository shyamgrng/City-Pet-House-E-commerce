"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";

const NAV_SECTIONS = [
  { href: "/admin/deliveries", label: "Deliveries", key: "deliveries" },
  { href: "/admin/vet-consults", label: "Vet Consults", key: "vetconsults" },
  { href: "/admin/shop", label: "Shop", key: "shop" },
  { href: "/admin/pets", label: "Pets Available", key: "shop" },
  { href: "/admin/registrations", label: "Pending Registrations", key: "dashboard" },
  { href: "/admin/services", label: "Services", key: "dashboard" },
  { href: "/admin/finance", label: "Finance", key: "finance" },
  { href: "/admin/users", label: "Users", key: "users" },
];

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const { admin, loading, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !admin) {
      router.replace("/admin/login");
    }
  }, [loading, admin, router]);

  if (loading || !admin) return null;

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-white">
        <div className="border-b border-border px-5 py-5">
          <p className="font-heading text-[15px] font-bold text-text-dark">City Pet House</p>
          <p className="text-[12px] text-text-muted">Admin Panel</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV_SECTIONS.map((item) => {
            const active = pathname.startsWith(item.href);
            const allowed = admin.permissions[item.key] !== false;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-disabled={!allowed}
                className={`rounded-control px-3 py-2 text-[13px] font-medium ${
                  active ? "bg-primary text-white" : "text-text-secondary hover:bg-bg-surface"
                } ${!allowed ? "pointer-events-none opacity-40" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          <p className="text-[12px] font-medium text-text-dark">{admin.name}</p>
          <p className="mb-2 text-[11px] text-text-muted">{admin.role}</p>
          <button
            onClick={() => logout().then(() => router.push("/admin/login"))}
            className="text-[12px] font-medium text-error hover:underline"
          >
            Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-auto p-8">{children}</main>
    </div>
  );
}
