"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const TABS = [
  { href: "/account/orders", label: "Orders" },
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/profile", label: "Profile" },
];

export default function AccountDashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/account/signin?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, router, pathname]);

  if (loading || !user) return null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[22px]">My Account</h1>
          <p className="text-[13px] text-text-secondary">{user.name} &middot; {user.email}</p>
        </div>
        <button
          onClick={() => logout().then(() => router.push("/"))}
          className="text-[13px] font-medium text-error hover:underline"
        >
          Sign Out
        </button>
      </div>

      <div className="mb-6 flex gap-2 border-b border-border">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 text-[13px] font-medium ${
              pathname === tab.href
                ? "border-b-2 border-primary text-primary"
                : "text-text-secondary hover:text-primary"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {children}
    </div>
  );
}
