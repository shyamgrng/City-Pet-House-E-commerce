import Link from "next/link";
import { parseLegalSections } from "@/lib/legal-types";
import type { LegalDoc } from "@/lib/legal-types";

export default function LegalPageView({ title, doc }: { title: string; doc: LegalDoc }) {
  const sections = parseLegalSections(doc.content);

  return (
    <div className="pb-10">
      <div style={{ background: "linear-gradient(135deg, #EAF4F9, #F3F9FC)" }} className="px-8 pt-11 pb-9">
        <Link href="/" className="text-[13px] text-primary font-semibold mb-4 inline-block">
          ← Back to Home
        </Link>
        <div className="font-heading font-bold text-[30px] text-[#1A2027] mb-3">{title}</div>
        <div className="text-[13px] text-[#5B6773] flex gap-[18px] flex-wrap">
          <div>Effective Date: {doc.effectiveDate}</div>
          <div>Last Updated: {doc.lastUpdated}</div>
        </div>
      </div>
      <div className="max-w-[760px] mx-auto px-8 pt-9">
        {sections.map((sec, i) => (
          <div key={i} className="mb-[34px] pb-[34px] border-b border-[#EEF1F2] last:border-0">
            <div className="flex items-baseline gap-2.5 mb-3.5">
              <div className="font-heading font-bold text-xs text-primary bg-[#EAF4F9] px-2.5 py-0.5 rounded-[20px] shrink-0">{sec.number}</div>
              <div className="font-heading font-bold text-[19px] text-[#1A2027]">{sec.heading}</div>
            </div>
            {sec.blocks.map((blk, bi) =>
              blk.isList ? (
                <ul key={bi} className="m-0 mb-3 pl-[22px]">
                  {blk.items.map((li, li2) => (
                    <li key={li2} className="text-sm text-[#3A4652] leading-[1.85] mb-1">
                      {li.text}
                    </li>
                  ))}
                </ul>
              ) : (
                <div key={bi} className="text-sm text-[#3A4652] leading-[1.85] mb-3">
                  {blk.text}
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
