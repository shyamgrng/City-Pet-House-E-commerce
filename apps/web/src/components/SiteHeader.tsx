"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

  const handleTopSignInClick = () => {
    if (isSignedIn) {
      signOut();
      router.push("/");
      return;
    }
    router.push(`/signin?redirect=${encodeURIComponent(pathname)}`);
  };

  const handleAccountClick = () => {
    if (isSignedIn) {
      router.push("/account");
      return;
    }
    router.push("/?notice=signin");
  };

  return (
    <div className="sticky top-0 z-10 bg-white">
      <div className="bg-[#F7F9FA] border-b border-[#E4E9EC]">
        <div className="flex items-center justify-center gap-4 max-w-7xl mx-auto px-8 py-1.5 text-[11px] text-[#5B6773]">
          <div>📞 {settings.phone}</div>
          <div>📍 {settings.address}</div>
          <div>{settings.hours}</div>
        </div>
      </div>

      <div className="border-b border-[#E4E9EC]">
        <div className="flex items-center gap-6 max-w-7xl mx-auto px-8 py-3.5">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Image
              src="/assets/cph-logo.jpeg"
              alt="logo"
              width={34}
              height={34}
              className="rounded-md object-contain"
            />
            <span className="font-heading font-bold text-[15px] text-[#1A2027]">City Pet House</span>
          </Link>

          <HeaderSearch />

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

      <div className="border-b border-[#E4E9EC]">
        <nav className="flex gap-[22px] max-w-7xl mx-auto px-8 py-2.5 text-[13px] text-[#3A4652] font-medium overflow-x-auto">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="cursor-pointer whitespace-nowrap hover:text-primary">
              {l.label}
            </Link>
          ))}
          {isSignedIn ? (
            <button onClick={handleTopSignInClick} className="cursor-pointer whitespace-nowrap hover:text-primary">
              Sign Out
            </button>
          ) : (
            <Link href="/portal" className="cursor-pointer whitespace-nowrap hover:text-primary">
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}
