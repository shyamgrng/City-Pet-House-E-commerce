"use client";

import Link from "next/link";
import { useState } from "react";
import { usePetTag } from "@/context/PetTagContext";

export default function AdminPetTagPagePage() {
  const { content, setBannerTitle, setBannerSubtitle, setSearchCaption, updateSection, addFaq, updateFaq, removeFaq } = usePetTag();
  const [saved, setSaved] = useState(false);

  const update = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-[640px]">
      <Link href="/admin/pages" className="text-xs font-semibold text-primary cursor-pointer mb-2.5 inline-block">
        ← Pages
      </Link>
      <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-1.5">Pet Tag Archive</div>
      <div className="text-xs text-[#5B6773] mb-[18px]">Editing the content shown on the public Pet Tag Archive page.</div>

      <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-5 mb-3.5">
        <Label>Banner Title</Label>
        <input
          value={content.bannerTitle}
          onChange={(e) => setBannerTitle(e.target.value)}
          className="w-full box-border h-9 rounded-md border border-[#E4E9EC] px-2.5 text-xs mb-3"
        />
        <Label>Banner Subtitle</Label>
        <input
          value={content.bannerSubtitle}
          onChange={(e) => setBannerSubtitle(e.target.value)}
          className="w-full box-border h-9 rounded-md border border-[#E4E9EC] px-2.5 text-xs mb-3"
        />
        <Label>Search Box Caption</Label>
        <textarea
          value={content.searchCaption}
          onChange={(e) => setSearchCaption(e.target.value)}
          rows={2}
          className="w-full box-border rounded-md border border-[#E4E9EC] px-2.5 py-2 text-xs resize-y font-sans"
        />
      </div>

      <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Page Sections</div>
      {content.sections.map((sec) => (
        <div key={sec.id} className="bg-white border border-[#E4E9EC] rounded-[10px] p-4 mb-2.5">
          <input
            value={sec.heading}
            onChange={(e) => updateSection(sec.id, { heading: e.target.value })}
            placeholder="Heading"
            className="w-full box-border h-8 rounded-md border border-[#E4E9EC] px-2.5 text-xs font-semibold mb-2"
          />
          <textarea
            value={sec.body}
            onChange={(e) => updateSection(sec.id, { body: e.target.value })}
            placeholder="Body"
            rows={3}
            className="w-full box-border rounded-md border border-[#E4E9EC] px-2.5 py-2 text-xs resize-y font-sans"
          />
        </div>
      ))}

      <div className="text-[13px] font-bold text-[#1A2027] mb-2.5 mt-[18px]">FAQs</div>
      {content.faqs.map((f) => (
        <div key={f.id} className="bg-white border border-[#E4E9EC] rounded-[10px] p-4 mb-2.5">
          <div className="flex justify-between items-start gap-2 mb-2">
            <input
              value={f.q}
              onChange={(e) => updateFaq(f.id, { q: e.target.value })}
              placeholder="Question"
              className="flex-1 box-border h-8 rounded-md border border-[#E4E9EC] px-2.5 text-xs font-semibold"
            />
            <div onClick={() => removeFaq(f.id)} className="text-[11px] font-semibold text-[#D64545] cursor-pointer whitespace-nowrap mt-1.5">
              Delete
            </div>
          </div>
          <textarea
            value={f.a}
            onChange={(e) => updateFaq(f.id, { a: e.target.value })}
            placeholder="Answer"
            rows={2}
            className="w-full box-border rounded-md border border-[#E4E9EC] px-2.5 py-2 text-xs resize-y font-sans"
          />
        </div>
      ))}
      <div onClick={addFaq} className="text-xs font-semibold text-primary cursor-pointer mb-[18px]">
        + Add FAQ
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
