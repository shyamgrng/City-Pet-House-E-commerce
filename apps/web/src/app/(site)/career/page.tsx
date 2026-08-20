"use client";

import Link from "next/link";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { useCareer } from "@/context/CareerContext";

export default function CareerPage() {
  const { content, ready } = useCareer();

  if (!ready) return null;

  return (
    <div>
      <ImagePlaceholder label="career banner image" className="w-full h-[280px]" />

      <div className="max-w-[1100px] mx-auto px-8 py-11 pb-14 flex gap-10 items-center flex-wrap">
        <ImagePlaceholder label="team / store photo" className="flex-1 min-w-[280px] h-[300px] rounded-2xl" />
        <div className="flex-1 min-w-[280px]">
          <div className="font-heading font-extrabold text-[28px] text-[#1A2027] leading-tight mb-[22px]">{content.headline}</div>
          <a
            href="#positions"
            className="inline-block bg-primary text-white px-[26px] py-[15px] rounded-[9px] text-[13px] font-bold tracking-[0.4px] cursor-pointer"
          >
            {content.ctaLabel}
          </a>
        </div>
      </div>

      <div id="positions" className="max-w-[1100px] mx-auto px-8 pb-14">
        <div className="font-heading font-bold text-xl text-[#1A2027] mb-5">Open Positions</div>
        <div className="grid gap-[18px]" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          {content.jobs.map((job) => (
            <div key={job.id} className="bg-white border border-[#E4E9EC] rounded-2xl p-[22px] flex flex-col">
              <ImagePlaceholder label="job photo" className="w-full h-[140px] mb-4" />
              <div className="font-heading font-bold text-base text-[#1A2027] mb-1">{job.title}</div>
              <div className="text-[11px] font-semibold text-primary mb-3">{job.tag}</div>
              <div className="text-[13px] text-[#5B6773] leading-[1.7] mb-[18px] flex-1">{job.desc}</div>
              <Link
                href={`/career/apply?role=${encodeURIComponent(job.title)}`}
                className="bg-primary text-white text-center py-[11px] rounded-lg text-xs font-bold"
              >
                Express Interest
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
