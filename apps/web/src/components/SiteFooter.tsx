"use client";

import Image from "next/image";
import Link from "next/link";
import { useServices } from "@/context/ServiceContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { footerCustomerCareLinks, footerGeneralLinks, footerQuickLinks } from "@/lib/home-data";

export default function SiteFooter() {
  const { services } = useServices();
  const { settings } = useSiteSettings();

  return (
    <div className="bg-[#1A2027] text-[#C9CFD4] pt-11 pb-6">
      <div className="max-w-7xl mx-auto px-8">
      <div className="flex items-center gap-3 mb-7">
        <Image src="/assets/cph-logo.jpeg" alt="logo" width={40} height={40} className="rounded-lg object-contain" />
        <span className="text-[22px] font-heading font-bold text-white">City Pet House</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1.3fr] gap-7 mb-7">
        <div>
          <div className="text-[15px] font-bold text-white mb-3">General</div>
          <div className="text-sm leading-[2.2]">
            {footerGeneralLinks.map((l) =>
              l.href ? (
                <Link key={l.label} href={l.href} className="block cursor-pointer hover:text-white">
                  {l.label}
                </Link>
              ) : (
                <div key={l.label} className="cursor-pointer hover:text-white">
                  {l.label}
                </div>
              )
            )}
          </div>
        </div>
        <div>
          <div className="text-[15px] font-bold text-white mb-3">Customer Care</div>
          <div className="text-sm leading-[2.2]">
            {footerCustomerCareLinks.map((l) => (
              <Link key={l.label} href={l.href} className="block cursor-pointer hover:text-white">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[15px] font-bold text-white mb-3">Quick Links</div>
          <div className="text-sm leading-[2.2]">
            {footerQuickLinks.map((l) => (
              <Link key={l.label} href={l.href} className="block cursor-pointer hover:text-white">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[15px] font-bold text-white mb-3">Our Services</div>
          <div className="text-sm leading-[2.2]">
            {services.slice(0, 6).map((s) => (
              <Link key={s.id} href={`/services/${s.id}`} className="block cursor-pointer hover:text-white">
                {s.name}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <Link href="/contact" className="block text-[15px] font-bold text-white mb-3 cursor-pointer hover:underline">
            Contact Us
          </Link>
          <div className="text-sm leading-[2.2]">
            {settings.address}
            <br />
            {settings.phone}
            <br />
            {settings.email}
            <br />
            {settings.hours}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 py-2.5 pb-[22px]">
        <Link
          href={settings.facebook}
          className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-heading font-bold text-lg"
        >
          f
        </Link>
        <Link href={settings.instagram}>
          <Image src="/assets/instagram-logo.svg" alt="Instagram" width={40} height={40} className="rounded-full" />
        </Link>
        <Link href={settings.tiktok} className="w-10 h-10 rounded-full bg-black overflow-hidden block">
          <Image src="/assets/tiktok-logo.webp" alt="TikTok" width={40} height={40} className="object-cover w-full h-full" />
        </Link>
        <Link
          href={settings.youtube}
          className="w-10 h-10 rounded-full bg-[#FF0000] text-white flex items-center justify-center text-base"
        >
          ▶
        </Link>
      </div>

      <div className="flex flex-wrap rounded-xl overflow-hidden mb-[22px]">
        <div className="flex-1 min-w-[320px] bg-[#F0F8F2] px-8 py-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <div className="font-heading font-bold text-lg text-[#1F7A4D]">Happy Pet Owner</div>
            <div className="font-heading font-bold text-[15px] text-[#1A2027]">Download Vaccination Record App</div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <AppBadge kind="ios" href={settings.vaccinationAppStoreUrl} />
            <AppBadge kind="android" href={settings.vaccinationGooglePlayUrl} />
          </div>
        </div>
        <div className="flex-1 min-w-[320px] bg-[#F3F9FC] px-8 py-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <div className="font-heading font-bold text-lg text-primary">Happy Shopping</div>
            <div className="font-heading font-bold text-[15px] text-[#1A2027]">{settings.shoppingAppLabel}</div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <AppBadge kind="ios" href={settings.shoppingAppStoreUrl} />
            <AppBadge kind="android" href={settings.shoppingGooglePlayUrl} />
          </div>
        </div>
      </div>

      <div className="border-t border-[#3A4652] pt-[18px] text-xs text-[#8A96A3] text-center">
        Copyright © 2026 City Pet House &amp; Animal Clinic. All Rights Reserved.
      </div>
      </div>
    </div>
  );
}

function AppBadge({ kind, href }: { kind: "ios" | "android"; href: string }) {
  return (
    <Link
      href={href || "#"}
      target={href && href !== "#" ? "_blank" : undefined}
      rel={href && href !== "#" ? "noopener noreferrer" : undefined}
      className="bg-black text-white rounded-lg px-4 py-2 flex items-center gap-2 cursor-pointer"
    >
      <div className="text-xl">{kind === "ios" ? "📱" : "▶"}</div>
      <div>
        <div className="text-[9px] leading-none">{kind === "ios" ? "Available on the" : "ANDROID APP ON"}</div>
        <div className="text-sm font-bold leading-tight">{kind === "ios" ? "App Store" : "Google Play"}</div>
      </div>
    </Link>
  );
}
