"use client";

import Link from "next/link";
import { useState } from "react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { useAbout } from "@/context/AboutContext";

export default function AdminAboutPage() {
  const { content, setIntro, setClosingText, addWhyChoose, updateWhyChoose, removeWhyChoose, updateCommitment } = useAbout();
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
      <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-1.5">About Us</div>
      <div className="text-xs text-[#5B6773] mb-[18px]">Editing the content shown on the public About Us page.</div>

      <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-5 mb-3.5">
        <Label>Introduction</Label>
        <textarea
          value={content.intro}
          onChange={(e) => setIntro(e.target.value)}
          rows={4}
          className="w-full box-border rounded-md border border-[#E4E9EC] px-2.5 py-2 text-xs resize-y font-sans"
        />
      </div>

      <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Why Choose Us?</div>
      {content.whyChoose.map((w) => (
        <div key={w.id} className="bg-white border border-[#E4E9EC] rounded-[10px] p-4 mb-2.5">
          <div className="flex gap-2.5 mb-2">
            <div className="w-20 shrink-0">
              <ImageUploadField
                value={w.icon || ""}
                onChange={(v) => updateWhyChoose(w.id, { icon: v })}
                label="icon"
                shape="rect"
                height="h-12"
                maxWidth={200}
                maxHeight={200}
              />
              <div className="text-[9px] text-[#8A96A3] mt-1 text-center">96×96px</div>
            </div>
            <input
              value={w.title}
              onChange={(e) => updateWhyChoose(w.id, { title: e.target.value })}
              placeholder="Title"
              className="flex-1 box-border h-8 rounded-md border border-[#E4E9EC] px-2.5 text-xs font-semibold"
            />
            <div onClick={() => removeWhyChoose(w.id)} className="text-[11px] font-semibold text-[#D64545] cursor-pointer whitespace-nowrap self-center">
              Delete
            </div>
          </div>
          <textarea
            value={w.desc}
            onChange={(e) => updateWhyChoose(w.id, { desc: e.target.value })}
            placeholder="Description"
            rows={2}
            className="w-full box-border rounded-md border border-[#E4E9EC] px-2.5 py-2 text-xs resize-y font-sans"
          />
        </div>
      ))}
      <div onClick={addWhyChoose} className="text-xs font-semibold text-primary cursor-pointer mb-[18px]">
        + Add another reason
      </div>

      <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Our Commitment to Your Pet&apos;s Wellbeing</div>
      {content.commitments.map((c) => (
        <div key={c.id} className="bg-white border border-[#E4E9EC] rounded-[10px] p-4 mb-2.5">
          <input
            value={c.title}
            onChange={(e) => updateCommitment(c.id, { title: e.target.value })}
            placeholder="Title"
            className="w-full box-border h-8 rounded-md border border-[#E4E9EC] px-2.5 text-xs font-semibold mb-2"
          />
          <textarea
            value={c.desc}
            onChange={(e) => updateCommitment(c.id, { desc: e.target.value })}
            placeholder="Description"
            rows={2}
            className="w-full box-border rounded-md border border-[#E4E9EC] px-2.5 py-2 text-xs resize-y font-sans"
          />
        </div>
      ))}

      <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-5 mt-3.5 mb-3.5">
        <Label>Closing Text</Label>
        <textarea
          value={content.closingText}
          onChange={(e) => setClosingText(e.target.value)}
          rows={4}
          className="w-full box-border rounded-md border border-[#E4E9EC] px-2.5 py-2 text-xs resize-y font-sans"
        />
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
