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

// Secondary links folded into the mobile "⋯" menu — primary nav (Home/Shop/Pets/Web
// Vet/Cart) lives in the mobile bottom tab bar instead (see MobileBottomNav.tsx).
const moreMenuLinks = [
  { label: "Services", href: "/services" },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/career" },
  { label: "FAQ", href: "/faq" },
  { label: "How to Buy", href: "/how-to-buy" },
  { label: "Dog Adoption", href: "/adoption" },
  { label: "Admin Login", href: "/admin/login" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Return & Refund", href: "/refund" },
];

export default function SiteHeader() {
  const { user, ready, signOut } = useAuth();
  const { count } = useCart();
  const { settings } = useSiteSettings();
  const router = useRouter();
  const pathname = usePathname();
  const isSignedIn = ready && !!user;
  const [moreOpen, setMoreOpen] = useState(false);

  const handleTopSignInClick = () => {
    setMoreOpen(false);
    if (isSignedIn) {
      signOut();
      router.push("/");
      return;
    }
    router.push(`/signin?redirect=${encodeURIComponent(pathname)}`);
  };

  const handleAccountClick = () => {
    setMoreOpen(false);
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

      {/* Desktop header */}
      <div className="hidden lg:block border-b border-[#E4E9EC]">
        <div className="flex items-center gap-6 max-w-7xl mx-auto px-8 py-3.5">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Image src="/assets/cph-logo.jpeg" alt="logo" width={34} height={34} className="rounded-md object-contain" />
            <span className="font-heading font-bold text-[15px] text-[#1A2027] whitespace-nowrap">City Pet House</span>
          </Link>

          <div className="flex flex-1">
            <HeaderSearch />
          </div>

          <button onClick={handleTopSignInClick} className="text-[13px] font-semibold text-primary shrink-0 whitespace-nowrap cursor-pointer">
            {isSignedIn ? "Sign Out" : "Pet Owner Sign In"}
          </button>
          <button onClick={handleAccountClick} className="text-[13px] font-medium text-[#3A4652] shrink-0 cursor-pointer">
            Account
          </button>
          <Link href="/cart" className="flex items-center gap-1.5 text-[13px] font-semibold text-primary shrink-0">
            🛒 Cart ({count})
          </Link>
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

      {/* Mobile header — single row (logo/tagline + utility icons), matching the design source exactly.
          Primary nav (Home/Shop/Pets/Web Vet/Cart) lives in the mobile bottom tab bar instead. */}
      <div className="lg:hidden bg-[#F7F9FA] relative">
        <div className="flex items-center justify-between px-4 pt-3.5 pb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <Image src="/assets/cph-logo.jpeg" alt="logo" width={28} height={28} className="rounded-lg object-contain w-7 h-7 shrink-0" />
            <span className="text-xs text-[#5B6773] truncate">One Roof Solution to Your Pet Care</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setMoreOpen((v) => !v)}
              aria-label={moreOpen ? "Close menu" : "More"}
              className="w-[30px] h-[30px] rounded-full bg-white border border-[#E4E9EC] flex items-center justify-center text-sm text-[#1A2027] cursor-pointer"
            >
              {moreOpen ? "✕" : "⋯"}
            </button>
            <button
              onClick={handleAccountClick}
              aria-label="Account"
              className="w-[30px] h-[30px] rounded-full bg-white border border-[#E4E9EC] flex items-center justify-center text-sm cursor-pointer"
            >
              👤
            </button>
          </div>
        </div>

        <div className="px-4 pb-3">
          <HeaderSearch />
        </div>

        {moreOpen && (
          <div className="absolute right-4 top-[52px] w-[220px] bg-white border border-[#E4E9EC] rounded-[10px] shadow-[0_6px_20px_rgba(0,0,0,0.1)] overflow-hidden z-30">
            {moreMenuLinks.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMoreOpen(false)}
                className={`block px-4 py-3 text-[13px] text-[#3A4652] cursor-pointer hover:bg-[#F7F9FA] ${i < moreMenuLinks.length - 1 ? "border-b border-[#EEF1F3]" : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
