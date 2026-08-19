import Image from "next/image";
import Link from "next/link";
import { siteSettings } from "@/lib/site-settings";
import { footerGeneralLinks, footerQuickLinks, footerServiceLinks } from "@/lib/home-data";

export default function SiteFooter() {
  return (
    <div className="bg-[#1A2027] text-[#C9CFD4] pt-11 px-8 pb-6">
      <div className="flex items-center gap-3 mb-7">
        <Image src="/assets/cph-logo.jpeg" alt="logo" width={40} height={40} className="rounded-lg object-contain" />
        <span className="text-[22px] font-heading font-bold text-white">City Pet House</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1.3fr] gap-7 mb-7">
        <div>
          <div className="text-[15px] font-bold text-white mb-3">General</div>
          <div className="text-sm leading-[2.2]">
            {footerGeneralLinks.map((l) => (
              <div key={l} className="cursor-pointer hover:text-white">
                {l}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[15px] font-bold text-white mb-3">Customer Care</div>
          <div className="text-sm leading-[2.2]">
            <div className="cursor-pointer hover:text-white">FAQ</div>
            <div className="cursor-pointer hover:text-white">How to Buy</div>
            <div className="cursor-pointer hover:text-white">Return &amp; Refund</div>
            <div className="cursor-pointer hover:text-white">Contact Us</div>
          </div>
        </div>
        <div>
          <div className="text-[15px] font-bold text-white mb-3">Quick Links</div>
          <div className="text-sm leading-[2.2]">
            {footerQuickLinks.map((l) => (
              <div key={l} className="cursor-pointer hover:text-white">
                {l}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[15px] font-bold text-white mb-3">Our Services</div>
          <div className="text-sm leading-[2.2]">
            {footerServiceLinks.map((l) => (
              <div key={l} className="cursor-pointer hover:text-white">
                {l}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[15px] font-bold text-white mb-3 cursor-pointer">Contact Us</div>
          <div className="text-sm leading-[2.2]">
            {siteSettings.address}
            <br />
            {siteSettings.phone}
            <br />
            {siteSettings.email}
            <br />
            {siteSettings.hours}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 py-2.5 pb-[22px]">
        <Link
          href={siteSettings.facebook}
          className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-heading font-bold text-lg"
        >
          f
        </Link>
        <Link href={siteSettings.instagram}>
          <Image src="/assets/instagram-logo.svg" alt="Instagram" width={40} height={40} className="rounded-full" />
        </Link>
        <Link href={siteSettings.tiktok} className="w-10 h-10 rounded-full bg-black overflow-hidden block">
          <Image src="/assets/tiktok-logo.webp" alt="TikTok" width={40} height={40} className="object-cover w-full h-full" />
        </Link>
        <Link
          href={siteSettings.youtube}
          className="w-10 h-10 rounded-full bg-[#FF0000] text-white flex items-center justify-center text-base"
        >
          ▶
        </Link>
      </div>

      <div className="flex flex-wrap rounded-xl overflow-hidden mb-[22px]">
        <div className="flex-1 min-w-[320px] bg-[#F0F8F2] px-8 py-7 flex items-center justify-center flex-wrap gap-5">
          <div>
            <div className="font-heading font-bold text-lg text-[#1F7A4D]">Happy Pet Owner</div>
            <div className="font-heading font-bold text-[15px] text-[#1A2027]">Download Vaccination Record App</div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <AppBadge kind="ios" />
            <AppBadge kind="android" />
          </div>
        </div>
        <div className="flex-1 min-w-[320px] bg-[#F3F9FC] px-8 py-7 flex items-center justify-center flex-wrap gap-5">
          <div>
            <div className="font-heading font-bold text-lg text-primary">Happy Shopping</div>
            <div className="font-heading font-bold text-[15px] text-[#1A2027]">{siteSettings.shoppingAppLabel}</div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <AppBadge kind="ios" />
            <AppBadge kind="android" />
          </div>
        </div>
      </div>

      <div className="border-t border-[#3A4652] pt-[18px] text-xs text-[#8A96A3] text-center">
        Copyright © 2026 City Pet House &amp; Animal Clinic. All Rights Reserved.
      </div>
    </div>
  );
}

function AppBadge({ kind }: { kind: "ios" | "android" }) {
  return (
    <div className="bg-black text-white rounded-lg px-4 py-2 flex items-center gap-2 cursor-pointer">
      <div className="text-xl">{kind === "ios" ? "📱" : "▶"}</div>
      <div>
        <div className="text-[9px] leading-none">{kind === "ios" ? "Available on the" : "ANDROID APP ON"}</div>
        <div className="text-sm font-bold leading-tight">{kind === "ios" ? "App Store" : "Google Play"}</div>
      </div>
    </div>
  );
}
