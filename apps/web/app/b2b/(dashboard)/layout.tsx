"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useB2BAuth } from "@/context/B2BAuthContext";

const NAV_LINKS = [
  { href: "/b2b/orders", label: "Incoming Orders" },
  { href: "/b2b/finance", label: "Finance" },
];

export default function B2BDashboardLayout({ children }: { children: ReactNode }) {
  const { supplier, loading, logout } = useB2BAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !supplier) {
      router.replace("/b2b/login");
    }
  }, [loading, supplier, router]);

  if (loading || !supplier) return null;

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-border bg-white px-6 py-4">
        <div>
          <p className="font-heading text-[15px] font-bold text-text-dark">City Pet House</p>
          <p className="text-[12px] text-text-muted">B2B Supplier Portal — {supplier.companyName}</p>
        </div>
        <div className="flex items-center gap-5">
          {supplier.verified ? (
            <nav className="flex items-center gap-4 text-[13px] font-medium text-text-secondary">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={pathname.startsWith(link.href) ? "text-primary" : "hover:text-primary"}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          ) : null}
          <button
            onClick={() => logout().then(() => router.push("/b2b/login"))}
            className="text-[12px] font-medium text-error hover:underline"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {!supplier.verified ? (
          <div className="rounded-card border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-6 text-center">
            <p className="mb-1 text-[15px] font-semibold text-text-dark">Your registration is under review</p>
            <p className="text-[13px] text-text-secondary">
              An admin needs to approve your account before you can see incoming orders and finance. You&apos;ll be able
              to sign in and use the portal as soon as your account is verified — no further action is needed from you.
            </p>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
