"use client";

import Link from "next/link";
import MediaSlot from "@/components/MediaSlot";
import { useAbout } from "@/context/AboutContext";

export default function AboutPage() {
  const { content, ready } = useAbout();

  if (!ready) return null;

  return (
    <div>
      <div style={{ background: "linear-gradient(135deg, #EAF4F9, #F3F9FC)" }} className="px-8 pt-11 pb-9">
        <div className="text-xs font-bold tracking-[1.5px] text-primary mb-2.5">ABOUT US</div>
        <div className="font-heading font-bold text-[30px] text-[#1A2027]">City Pet House &amp; Animal Clinic</div>
      </div>

      <div className="max-w-[760px] mx-auto px-8 py-9 pb-14">
        <div className="text-[13px] font-bold text-primary tracking-[1px] mb-2.5">INTRODUCTION</div>
        <div className="text-[15px] text-[#3A4652] leading-[1.9] mb-8">{content.intro}</div>

        <div className="font-heading font-bold text-xl text-[#1A2027] mb-[18px]">Why Choose Us?</div>
        <div className="flex flex-col gap-4 mb-9">
          {content.whyChoose.map((w) => (
            <div key={w.id} className="flex gap-3.5 items-start">
              <MediaSlot src={w.icon} label="icon" shape="circle" className="w-10 h-10 shrink-0" />
              <div className="text-sm text-[#3A4652] leading-[1.7]">
                <strong className="text-[#1A2027]">{w.title}</strong> – {w.desc}
              </div>
            </div>
          ))}
        </div>

        <div className="font-heading font-bold text-xl text-[#1A2027] mb-[18px]">Our Commitment to Your Pet&apos;s Wellbeing</div>
        <div className="text-sm text-[#3A4652] leading-[1.7] mb-3.5">
          We understand the special bond you share with your pets. That&apos;s why our team provides:
        </div>
        <div className="flex flex-col gap-3 mb-8">
          {content.commitments.map((c) => (
            <div key={c.id} className="flex gap-3 items-start">
              <div className="text-[#1F7A4D] font-bold text-[15px] shrink-0">✔</div>
              <div className="text-sm text-[#3A4652] leading-[1.7]">
                <strong className="text-[#1A2027]">{c.title}</strong> – {c.desc}
              </div>
            </div>
          ))}
        </div>

        <div className="text-sm text-[#3A4652] leading-[1.8] mb-6 whitespace-pre-wrap">{content.closingText}</div>

        <div className="bg-[#1A2027] rounded-2xl p-8 flex justify-between items-center flex-wrap gap-5">
          <div>
            <div className="font-heading font-bold text-lg text-white mb-1">Ready to book an appointment?</div>
            <div className="text-[13px] text-[#9BB0BE]">📞 Contact us today to book your pet&apos;s visit.</div>
          </div>
          <Link href="/contact" className="bg-primary text-white px-[26px] py-3.5 rounded-[9px] text-[13px] font-bold whitespace-nowrap">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
