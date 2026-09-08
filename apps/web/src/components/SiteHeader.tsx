"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import HeaderSearch from "./HeaderSearch";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Services", href: "/services" },
  { label: "Pets Available", href: "/pets" },
  { label: "Adoption", href: "/adoption" },
  { label: "Web Vet", href: "/vet" },
  { label: "Blog", href: "/blog" },
];

export default function SiteHeader() {
  const { user, ready, signOut } = useAuth();
  const { count } = useCart();
  const { settings } = useSiteSettings();
  const router = useRouter();
  const pathname = usePathname();
  const isSignedIn = ready && !!user;
  const [menuOpen, setMenuOpen] = useState(false);

  const handleTopSignInClick = () => {
    setMenuOpen(false);
    if (isSignedIn) {
      signOut();
      router.push("/");
      return;
    }
    router.push(`/signin?redirect=${encodeURIComponent(pathname)}`);
  };

  const handleAccountClick = () => {
    setMenuOpen(false);
    if (isSignedIn) {
      router.push("/account");
      return;
    }
    router.push("/?notice=signin");
  };

  return (
    <div className="sticky top-0 z-20 bg-white">
      <div className="hidden lg:block bg-[#F7F9FA] border-b border-[#E4E9EC]">
        <div className="flex items-center justify-center gap-4 max-w-7xl mx-auto px-4 lg:px-8 py-1.5 text-[11px] text-[#5B6773]">
          <div>📞 {settings.phone}</div>
          <div>📍 {settings.address}</div>
          <div>{settings.hours}</div>
        </div>
      </div>

      <div className="border-b border-[#E4E9EC]">
        <div className="flex items-center gap-3 lg:gap-6 max-w-7xl mx-auto px-4 lg:px-8 py-3 lg:py-3.5">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden shrink-0 w-9 h-9 flex items-center justify-center rounded-md border border-[#E4E9EC] cursor-pointer text-lg"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? "✕" : "☰"}
          </button>

          <Link href="/" className="flex items-center gap-2 lg:gap-2.5 shrink-0" onClick={() => setMenuOpen(false)}>
            <Image
              src="/assets/cph-logo.jpeg"
              alt="logo"
              width={34}
              height={34}
              className="rounded-md object-contain w-8 h-8 lg:w-[34px] lg:h-[34px]"
            />
            <span className="font-heading font-bold text-[13px] lg:text-[15px] text-[#1A2027] whitespace-nowrap">City Pet House</span>
          </Link>

          <div className="hidden lg:flex flex-1">
            <HeaderSearch />
          </div>

          <button
            onClick={handleTopSignInClick}
            className="hidden lg:inline text-[13px] font-semibold text-primary shrink-0 whitespace-nowrap cursor-pointer"
          >
            {isSignedIn ? "Sign Out" : "Pet Owner Sign In"}
          </button>
          <button onClick={handleAccountClick} className="hidden lg:inline text-[13px] font-medium text-[#3A4652] shrink-0 cursor-pointer">
            Account
          </button>
          <Link href="/cart" className="flex items-center gap-1.5 text-[13px] font-semibold text-primary shrink-0 ml-auto lg:ml-0">
            🛒 <span className="hidden lg:inline">Cart</span> ({count})
          </Link>
        </div>
        <div className="lg:hidden px-4 pb-3">
          <HeaderSearch />
        </div>
      </div>

      <div className="hidden lg:block border-b border-[#E4E9EC]">
        <nav className="flex gap-[22px] max-w-7xl mx-auto px-4 lg:px-8 py-2.5 text-[13px] text-[#3A4652] font-medium overflow-x-auto">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="cursor-pointer whitespace-nowrap hover:text-primary">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-b border-[#E4E9EC] bg-white max-h-[calc(100vh-56px)] overflow-y-auto">
          <div className="px-4 py-1.5 text-[11px] text-[#5B6773] border-b border-[#F0F2F4]">
            <div className="py-1.5">📞 {settings.phone}</div>
            <div className="py-1.5">📍 {settings.address}</div>
            <div className="py-1.5">{settings.hours}</div>
          </div>
          <nav className="flex flex-col px-4 py-1 text-sm text-[#3A4652] font-medium">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="py-3 border-b border-[#F0F2F4] last:border-0">
                {l.label}
              </Link>
            ))}
            <button onClick={handleAccountClick} className="text-left py-3 border-b border-[#F0F2F4] text-[#3A4652] font-medium cursor-pointer">
              Account
            </button>
            <button onClick={handleTopSignInClick} className="text-left py-3 text-primary font-semibold cursor-pointer">
              {isSignedIn ? "Sign Out" : "Pet Owner Sign In"}
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
