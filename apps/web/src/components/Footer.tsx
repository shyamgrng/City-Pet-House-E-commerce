import Link from "next/link";
import Image from "next/image";
import { apiFetch } from "@/lib/api";

const GENERAL_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/careers", label: "Career" },
  { href: "/pet-tags", label: "Pet Tag Archive" },
  { href: "/microchip-archive", label: "Microchipping Archive" },
  { href: "/dog-breeds", label: "Dog Breed Archive" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
];

const CUSTOMER_CARE_LINKS = [
  { href: "/faq", label: "FAQ" },
  { href: "/how-to-buy", label: "How to Buy" },
  { href: "/refund-policy", label: "Return & Refund" },
  { href: "/contact", label: "Contact Us" },
];

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/pets", label: "Pets Available" },
  { href: "/adoption", label: "Adoption" },
  { href: "/services", label: "Services" },
  { href: "/vet", label: "Web Vet" },
  { href: "/blog", label: "Blog" },
];

interface FooterService {
  id: string;
  name: string;
}

async function getServices() {
  return apiFetch<FooterService[]>("/services").catch(() => []);
}

export async function Footer() {
  const services = (await getServices()).slice(0, 6);

  return (
    <footer className="mt-16 bg-text-dark text-[#C9CFD4]">
      <div className="mx-auto max-w-7xl px-6 pb-6 pt-11">
        <div className="mb-7 flex items-center gap-3">
          <Image src="/cph-logo.jpeg" alt="City Pet House logo" width={40} height={40} className="rounded-control" />
          <span className="font-heading text-[22px] font-bold text-white">City Pet House</span>
        </div>

        <div className="mb-7 grid grid-cols-2 gap-7 sm:grid-cols-3 lg:grid-cols-5">
          <div>
            <p className="mb-3 text-[15px] font-bold text-white">General</p>
            <ul className="flex flex-col gap-2 text-[14px]">
              {GENERAL_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-[15px] font-bold text-white">Customer Care</p>
            <ul className="flex flex-col gap-2 text-[14px]">
              {CUSTOMER_CARE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-[15px] font-bold text-white">Quick Links</p>
            <ul className="flex flex-col gap-2 text-[14px]">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-[15px] font-bold text-white">Our Services</p>
            <ul className="flex flex-col gap-2 text-[14px]">
              {services.map((svc) => (
                <li key={svc.id}>
                  <Link href={`/services/${svc.id}`} className="hover:text-white">
                    {svc.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-[15px] font-bold text-white">Contact Us</p>
            <p className="text-[14px] leading-loose">
              Boudha, Gokarneshwor-6, Kathmandu
              <br />
              +977 9851313717
              <br />
              info@citypethouse.com.np
              <br />
              9:00 AM – 7:00 PM, daily
            </p>
          </div>
        </div>

        <div className="mb-5 flex justify-end gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] font-heading text-[18px] font-bold text-white">
            f
          </span>
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white">
            <Image src="/instagram-logo.svg" alt="Instagram" width={40} height={40} />
          </span>
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-black">
            <Image src="/tiktok-logo.webp" alt="TikTok" width={40} height={40} className="object-cover" />
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF0000] text-white">▶</span>
        </div>

        <div className="border-t border-[#3A4652] pt-4 text-center text-[12px] text-text-muted">
          Copyright © 2026 City Pet House &amp; Animal Clinic. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
