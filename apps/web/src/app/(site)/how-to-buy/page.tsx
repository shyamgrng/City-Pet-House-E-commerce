"use client";

import Link from "next/link";
import { useHowToBuy } from "@/context/HowToBuyContext";

export default function HowToBuyPage() {
  const { content, ready } = useHowToBuy();
  if (!ready) return null;

  return (
    <div className="pb-12">
      <div style={{ background: "linear-gradient(135deg, #EAF4F9, #F3F9FC)" }} className="px-8 pt-11 pb-9">
        <Link href="/" className="text-[13px] text-primary font-semibold mb-4 inline-block">
          ← Back to Home
        </Link>
        <div className="font-heading font-bold text-[30px] text-[#1A2027] mb-3.5">How to Buy from City Pet House</div>
        <div className="text-sm text-[#3A4652] leading-[1.8]">{content.intro}</div>
      </div>

      <div className="max-w-[760px] mx-auto px-8 pt-9">
        <div className="bg-white border border-[#E4E9EC] rounded-2xl p-5 flex gap-4 items-center mb-9">
          <div className="w-16 h-16 rounded-xl bg-[#1A2027] text-white flex items-center justify-center text-2xl shrink-0">▶</div>
          <div>
            <div className="text-[11px] font-bold text-primary mb-0.5">WATCH THE VIDEO</div>
            <div className="text-[15px] font-bold text-[#1A2027]">How to Order Pet Products Online from City Pet House</div>
            <div className="text-xs text-[#8A96A3] mt-0.5">Step-by-step tutorial with screen recording &amp; voice explanation</div>
          </div>
        </div>

        {content.steps.map((step, i) => (
          <div key={i} className="flex gap-5 mb-2">
            <div className="flex flex-col items-center shrink-0 w-[52px]">
              <div className="w-[52px] h-[52px] rounded-full bg-primary text-white flex items-center justify-center text-[22px] font-bold">
                {step.icon}
              </div>
              {i < content.steps.length - 1 && <div className="w-0.5 flex-1 bg-[#E4E9EC] mt-1.5 min-h-[24px]" />}
            </div>
            <div className="flex-1 pb-8">
              <div className="text-[11px] font-bold text-primary mb-1">STEP {i + 1}</div>
              <div className="font-heading font-bold text-lg text-[#1A2027] mb-2">{step.title}</div>
              <div className="text-sm text-[#3A4652] leading-[1.7] mb-2.5">{step.desc}</div>
              {step.items.length > 0 && (
                <ul className="m-0 mb-2.5 pl-5">
                  {step.items.map((it, ii) => (
                    <li key={ii} className="text-[13px] text-[#3A4652] leading-[1.8]">
                      {it}
                    </li>
                  ))}
                </ul>
              )}
              {step.note && <div className="text-xs text-[#C9962B] bg-[#FDF6E9] rounded-lg px-3 py-2.5 mb-2.5">⚠ {step.note}</div>}
              {step.benefits && <div className="text-xs text-[#1F7A4D] bg-[#E9F5EE] rounded-lg px-3 py-2.5 mb-2.5">✓ {step.benefits}</div>}
              {step.video && (
                <div className="bg-[#F7F8F9] border border-dashed border-[#D8DEE2] rounded-[10px] px-3.5 py-3 flex items-center gap-2.5">
                  <div className="w-[34px] h-[34px] rounded-lg bg-[#1A2027] text-white flex items-center justify-center text-sm shrink-0">▶</div>
                  <div className="text-xs text-[#5B6773] font-semibold">{step.video}</div>
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="bg-[#1A2027] rounded-2xl p-8 text-center mt-2">
          <div className="font-heading font-bold text-xl text-white mb-2">Need Help With Your Order?</div>
          <div className="text-[13px] text-[#9BB0BE] mb-[18px]">Our team is ready to assist you.</div>
          <div className="text-[13px] text-white leading-[2]">
            City Pet House &amp; Animal Clinic
            <br />
            info@citypethouse.com.np · +977-9851313717
          </div>
        </div>
      </div>
    </div>
  );
}
