"use client";

import Link from "next/link";
import { useState } from "react";
import { useCareer } from "@/context/CareerContext";

export default function AdminCareerPagePage() {
  const { content, setHeadline, setCtaLabel, addJob, updateJob, removeJob } = useCareer();
  const [saved, setSaved] = useState(false);

  const update = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-[620px]">
      <Link href="/admin/pages" className="text-xs font-semibold text-primary cursor-pointer mb-2.5 inline-block">
        ← Pages
      </Link>
      <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-1.5">Career</div>
      <div className="text-xs text-[#5B6773] mb-[18px]">Editing the content shown on the public Career page.</div>

      <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-5 mb-3.5">
        <div className="text-[11px] font-bold text-[#8A96A3] mb-2">BANNER IMAGE</div>
        <div className="text-[11px] text-[#8A96A3] mb-2">Recommended size: 1600×400px, JPG/WEBP under 500KB.</div>
        <div className="w-full h-[100px] rounded-lg bg-[#EDEFF1] flex items-center justify-center text-[10px] text-[#8A96A3]">career banner image</div>
      </div>

      <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-5 mb-3.5">
        <Label>Headline</Label>
        <input
          value={content.headline}
          onChange={(e) => setHeadline(e.target.value)}
          className="w-full box-border h-9 rounded-md border border-[#E4E9EC] px-2.5 text-xs mb-3"
        />
        <Label>CTA Button Label</Label>
        <input
          value={content.ctaLabel}
          onChange={(e) => setCtaLabel(e.target.value)}
          className="w-full box-border h-9 rounded-md border border-[#E4E9EC] px-2.5 text-xs"
        />
      </div>

      <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Open Positions</div>
      {content.jobs.map((job) => (
        <div key={job.id} className="bg-white border border-[#E4E9EC] rounded-[10px] p-4 mb-2.5">
          <div className="flex gap-2.5 mb-2 items-start">
            <div className="w-14 h-14 rounded-lg bg-[#EDEFF1] flex items-center justify-center text-[8px] text-[#8A96A3] text-center shrink-0">
              job photo
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start gap-2 mb-2">
                <input
                  value={job.title}
                  onChange={(e) => updateJob(job.id, { title: e.target.value })}
                  placeholder="Job Title"
                  className="flex-1 box-border h-8 rounded-md border border-[#E4E9EC] px-2.5 text-xs font-semibold"
                />
                <div onClick={() => removeJob(job.id)} className="text-[11px] font-semibold text-[#D64545] cursor-pointer whitespace-nowrap mt-1.5">
                  Delete
                </div>
              </div>
              <input
                value={job.tag}
                onChange={(e) => updateJob(job.id, { tag: e.target.value })}
                placeholder="Type · Location"
                className="w-full box-border h-8 rounded-md border border-[#E4E9EC] px-2.5 text-xs mb-2"
              />
            </div>
          </div>
          <textarea
            value={job.desc}
            onChange={(e) => updateJob(job.id, { desc: e.target.value })}
            placeholder="Description"
            rows={2}
            className="w-full box-border rounded-md border border-[#E4E9EC] px-2.5 py-2 text-xs resize-y font-sans"
          />
        </div>
      ))}
      <div onClick={addJob} className="text-xs font-semibold text-primary cursor-pointer mb-[18px]">
        + Add Position
      </div>

      <button onClick={update} className="bg-primary text-white text-center px-5 py-3 rounded-[9px] text-sm font-semibold cursor-pointer max-w-[180px]">
        Update
      </button>
      {saved && <div className="text-xs text-[#1F7A4D] mt-2.5">✓ Saved</div>}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-bold text-[#8A96A3] mb-1.5">{children}</div>;
}
