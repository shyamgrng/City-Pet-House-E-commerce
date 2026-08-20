"use client";

import Link from "next/link";
import { useState } from "react";
import { useHowToBuy } from "@/context/HowToBuyContext";

export default function AdminHowToBuyPage() {
  const { content, setIntro, setStepTitle, setStepDesc } = useHowToBuy();
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
      <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-1.5">How to Buy</div>
      <div className="text-xs text-[#5B6773] mb-[18px]">Intro text and each step&apos;s title/description on the public How to Buy page.</div>

      <Label>Introduction</Label>
      <textarea
        value={content.intro}
        onChange={(e) => setIntro(e.target.value)}
        rows={4}
        className="w-full box-border rounded-lg border border-[#E4E9EC] px-3 py-2.5 text-[13px] resize-y font-sans mb-5"
      />

      {content.steps.map((step, i) => (
        <div key={i} className="bg-white border border-[#E4E9EC] rounded-[10px] p-4 mb-3">
          <Label>Step Title</Label>
          <input
            value={step.title}
            onChange={(e) => setStepTitle(i, e.target.value)}
            className="w-full box-border h-9 rounded-md border border-[#E4E9EC] px-2.5 text-[13px] font-semibold mb-2.5"
          />
          <Label>Step Description</Label>
          <textarea
            value={step.desc}
            onChange={(e) => setStepDesc(i, e.target.value)}
            rows={2}
            className="w-full box-border rounded-md border border-[#E4E9EC] px-2.5 py-2 text-[13px] resize-y font-sans"
          />
        </div>
      ))}

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
