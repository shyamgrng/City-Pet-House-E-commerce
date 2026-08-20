"use client";

import Link from "next/link";
import { useState } from "react";
import type { LegalDoc } from "@/lib/legal-types";

export default function LegalDocEditor({
  title,
  helpText,
  doc,
  onUpdate,
}: {
  title: string;
  helpText: string;
  doc: LegalDoc;
  onUpdate: (patch: Partial<LegalDoc>) => void;
}) {
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
      <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-1.5">{title}</div>
      <div className="text-xs text-[#5B6773] mb-[18px]">{helpText}</div>

      <div className="flex gap-3 mb-3.5">
        <div className="flex-1">
          <Label>Effective Date</Label>
          <input
            value={doc.effectiveDate}
            onChange={(e) => onUpdate({ effectiveDate: e.target.value })}
            className="w-full box-border h-[38px] rounded-lg border border-[#E4E9EC] px-3 text-[13px]"
          />
        </div>
        <div className="flex-1">
          <Label>Last Updated</Label>
          <input
            value={doc.lastUpdated}
            onChange={(e) => onUpdate({ lastUpdated: e.target.value })}
            className="w-full box-border h-[38px] rounded-lg border border-[#E4E9EC] px-3 text-[13px]"
          />
        </div>
      </div>

      <Label>Full Content</Label>
      <textarea
        value={doc.content}
        onChange={(e) => onUpdate({ content: e.target.value })}
        className="w-full box-border h-[420px] rounded-lg border border-[#E4E9EC] p-3 text-xs font-mono leading-relaxed resize-y mb-4"
      />

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
