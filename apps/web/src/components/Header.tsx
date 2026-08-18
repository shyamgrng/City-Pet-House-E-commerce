"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/pets", label: "Pets Available" },
  { href: "/adoption", label: "Adoption" },
  { href: "/services", label: "Services" },
  { href: "/blog", label: "Blog" },
];

export function Header() {
  const { user } = useAuth();
  const cart = useCart();
  const router = useRouter();
  const [search, setSearch] = useState("");

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/shop?search=${encodeURIComponent(search)}`);
  }

  return (
    <header className="sticky top-0 z-30 bg-white shadow-floating">
      <div className="hidden bg-text-dark px-6 py-1.5 text-[11px] text-white sm:flex sm:justify-between">
        <span>City Pet House &amp; Animal Clinic — Kathmandu</span>
        <span>+977 9851313717 &middot; Open 9:00 AM – 7:00 PM</span>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3">
        <Link href="/" className="font-heading text-lg font-bold text-primary">
          City Pet House
        </Link>

        <form onSubmit={onSearch} className="flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, pets, services…"
            className="w-full rounded-control border border-border bg-bg-surface px-4 py-2 text-[13px] outline-none focus:border-primary"
          />
        </form>

        <nav className="hidden items-center gap-5 text-[13px] font-medium text-text-secondary md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>

        <Link href="/cart" className="relative text-[13px] font-medium text-text-dark hover:text-primary">
          Cart
          {cart.items.length > 0 && (
            <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white">
              {cart.items.length}
            </span>
          )}
        </Link>

        <Link
          href={user ? "/account" : "/account/signin"}
          className="rounded-control bg-primary px-4 py-2 text-[13px] font-semibold text-white hover:opacity-90"
        >
          {user ? user.name.split(" ")[0] : "Pet Owner Sign In"}
        </Link>

        <Link href="/staff/signin" className="hidden text-[12px] text-text-muted hover:text-primary lg:inline">
          Sign In
        </Link>
      </div>
    </header>
  );
}
