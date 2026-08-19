import Image from "next/image";
import Link from "next/link";
import { siteSettings } from "@/lib/site-settings";

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
  return (
    <div className="sticky top-0 z-10 bg-white">
      <div className="flex items-center justify-center gap-4 px-8 py-1.5 bg-[#F7F9FA] text-[11px] text-[#5B6773] border-b border-[#E4E9EC]">
        <div>📞 {siteSettings.phone}</div>
        <div>📍 {siteSettings.address}</div>
        <div>{siteSettings.hours}</div>
      </div>

      <div className="flex items-center gap-6 px-8 py-3.5 border-b border-[#E4E9EC]">
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

        <div className="flex-1 h-[42px] rounded-lg bg-[#F7F9FA] border-[1.5px] border-primary flex items-center pl-3.5 pr-1.5 gap-2 relative">
          <input
            placeholder="Search for dog food, vet booking, puppies…"
            className="flex-1 text-[13px] text-[#1A2027] bg-transparent outline-none h-full"
          />
          <button className="bg-primary text-white h-8 px-[18px] rounded-md flex items-center text-xs font-semibold shrink-0 cursor-pointer">
            Search
          </button>
        </div>

        <Link href="/account" className="text-[13px] font-semibold text-primary shrink-0 whitespace-nowrap">
          Pet Owner Sign In
        </Link>
        <Link href="/account" className="text-[13px] font-medium text-[#3A4652] shrink-0">
          Account
        </Link>
        <Link href="/cart" className="flex items-center gap-1.5 text-[13px] font-semibold text-primary shrink-0">
          🛒 Cart (0)
        </Link>
      </div>

      <nav className="flex gap-[22px] px-8 py-2.5 text-[13px] text-[#3A4652] font-medium border-b border-[#E4E9EC] overflow-x-auto">
        {navLinks.map((l) => (
          <Link key={l.href} href={l.href} className="cursor-pointer whitespace-nowrap hover:text-primary">
            {l.label}
          </Link>
        ))}
        <Link href="/staff/login" className="cursor-pointer whitespace-nowrap hover:text-primary">
          Sign In
        </Link>
      </nav>
    </div>
  );
}
