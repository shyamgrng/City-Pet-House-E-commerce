"use client";

import Link from "next/link";
import { useState } from "react";
import { useFaq } from "@/context/FaqContext";

export default function AdminFaqPage() {
  const { content, setPageTitle, setPageSubtitle, setContactHeading, setContactSubtext, addItem, updateItem, removeItem } = useFaq();
  const [saved, setSaved] = useState(false);

  const update = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-[720px]">
      <Link href="/admin/pages" className="text-xs font-semibold text-primary cursor-pointer mb-2.5 inline-block">
        ← Pages
      </Link>
      <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-1.5">FAQ</div>
      <div className="text-xs text-[#5B6773] mb-[18px]">Add, edit, categorize, or remove questions shown on the public FAQ page.</div>

      <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-4 mb-5">
        <Label>Page Title</Label>
        <input
          value={content.pageTitle}
          onChange={(e) => setPageTitle(e.target.value)}
          className="w-full box-border h-9 rounded-md border border-[#E4E9EC] px-2.5 text-xs font-semibold mb-3"
        />
        <Label>Subtitle</Label>
        <textarea
          value={content.pageSubtitle}
          onChange={(e) => setPageSubtitle(e.target.value)}
          rows={2}
          className="w-full box-border rounded-md border border-[#E4E9EC] px-2.5 py-2 text-xs resize-y font-sans mb-3"
        />
        <Label>Contact Section Heading</Label>
        <input
          value={content.contactHeading}
          onChange={(e) => setContactHeading(e.target.value)}
          className="w-full box-border h-9 rounded-md border border-[#E4E9EC] px-2.5 text-xs font-semibold mb-3"
        />
        <Label>Contact Section Subtext</Label>
        <input
          value={content.contactSubtext}
          onChange={(e) => setContactSubtext(e.target.value)}
          className="w-full box-border h-9 rounded-md border border-[#E4E9EC] px-2.5 text-xs"
        />
      </div>

      <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Questions</div>
      {content.items.map((fa) => (
        <div key={fa.id} className="bg-white border border-[#E4E9EC] rounded-[10px] p-4 mb-2.5">
          <div className="flex gap-2.5 mb-2.5">
            <div className="flex-1">
              <Label>Category</Label>
              <input
                value={fa.cat}
                onChange={(e) => updateItem(fa.id, { cat: e.target.value })}
                className="w-full box-border h-[34px] rounded-md border border-[#E4E9EC] px-2.5 text-xs"
              />
            </div>
            <div onClick={() => removeItem(fa.id)} className="text-xs font-semibold text-[#D64545] cursor-pointer self-end pb-2 whitespace-nowrap">
              Remove
            </div>
          </div>
          <Label>Question</Label>
          <input
            value={fa.q}
            onChange={(e) => updateItem(fa.id, { q: e.target.value })}
            className="w-full box-border h-9 rounded-md border border-[#E4E9EC] px-2.5 text-xs font-semibold mb-2.5"
          />
          <Label>Answer</Label>
          <textarea
            value={fa.a}
            onChange={(e) => updateItem(fa.id, { a: e.target.value })}
            rows={3}
            className="w-full box-border rounded-md border border-[#E4E9EC] px-2.5 py-2 text-xs resize-y font-sans"
          />
        </div>
      ))}
      <div onClick={addItem} className="text-xs font-semibold text-primary cursor-pointer mb-4">
        + Add another question
      </div>

      <button onClick={update} className="bg-primary text-white text-center px-5 py-3 rounded-[9px] text-sm font-semibold cursor-pointer max-w-[180px]">
        Update
      </button>
      {saved && <div className="text-xs text-[#1F7A4D] mt-2.5">✓ Changes are live on the website</div>}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-bold text-[#8A96A3] mb-1.5">{children}</div>;
}
