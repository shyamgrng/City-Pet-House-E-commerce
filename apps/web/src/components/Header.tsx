"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/services", label: "Services" },
  { href: "/pets", label: "Pets Available" },
  { href: "/adoption", label: "Adoption" },
  { href: "/vet", label: "Web Vet" },
  { href: "/blog", label: "Blog" },
];

const PHONE = "+977 9851313717";
const ADDRESS = "Boudha Pipal Bot, Aryal Gaun, Gokarneshwor-6, Kathmandu";
const HOURS = "9am – 7pm, Sun–Sat";

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
      <div className="hidden flex-wrap items-center justify-center gap-4 border-b border-border bg-bg-surface px-6 py-1.5 text-[11px] text-text-secondary sm:flex">
        <span>📞 {PHONE}</span>
        <span>📍 {ADDRESS}</span>
        <span>{HOURS}</span>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3.5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image src="/cph-logo.jpeg" alt="City Pet House logo" width={34} height={34} className="rounded-control object-contain" />
          <span className="font-heading text-[15px] font-bold text-text-dark">City Pet House</span>
        </Link>

        <form onSubmit={onSearch} className="flex h-[42px] flex-1 items-center gap-2 rounded-control border-[1.5px] border-primary bg-bg-surface pl-3.5 pr-1.5">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for dog food, vet booking, puppies…"
            className="h-full flex-1 border-none bg-transparent text-[13px] text-text-dark outline-none"
          />
          <button type="submit" className="shrink-0 rounded-control bg-primary px-4 py-2 text-[12px] font-semibold text-white">
            Search
          </button>
        </form>

        <Link
          href={user ? "/account" : "/account/signin"}
          className="shrink-0 whitespace-nowrap text-[13px] font-semibold text-primary hover:opacity-80"
        >
          {user ? user.name.split(" ")[0] : "Pet Owner Sign In"}
        </Link>
        <Link href="/account" className="hidden shrink-0 text-[13px] font-medium text-text-secondary hover:text-primary md:inline">
          Account
        </Link>
        <Link href="/cart" className="shrink-0 whitespace-nowrap text-[13px] font-semibold text-primary hover:opacity-80">
          🛒 Cart ({cart.items.length})
        </Link>
      </div>

      <nav className="hidden items-center gap-6 overflow-x-auto border-t border-border px-6 py-2.5 text-[13px] font-medium text-text-secondary md:flex">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="whitespace-nowrap hover:text-primary">
            {link.label}
          </Link>
        ))}
        <Link
          href="/staff/signin"
          className="ml-auto shrink-0 whitespace-nowrap rounded-full border border-border px-3 py-1 text-[12px] font-semibold text-text-secondary hover:border-primary hover:text-primary"
        >
          Staff / B2B / Doctor Sign In
        </Link>
      </nav>
    </header>
  );
}
