"use client";

import Link from "next/link";
import { useState } from "react";
import { useContactPage } from "@/context/ContactContext";

export default function AdminContactPage() {
  const { content, setIntro, setMapLink } = useContactPage();
  const [saved, setSaved] = useState(false);

  const update = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-[560px]">
      <Link href="/admin/pages" className="text-xs font-semibold text-primary cursor-pointer mb-2.5 inline-block">
        ← Pages
      </Link>
      <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-1.5">Contact Us</div>
      <div className="text-xs text-[#5B6773] mb-[18px]">Editing the intro copy and map on the public Contact Us page.</div>

      <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-5 mb-3.5">
        <Label>Intro Text</Label>
        <textarea
          value={content.intro}
          onChange={(e) => setIntro(e.target.value)}
          rows={3}
          className="w-full box-border rounded-md border border-[#E4E9EC] px-2.5 py-2 text-xs resize-y font-sans mb-3"
        />
        <Label>Google Maps Embed Link</Label>
        <input
          value={content.mapLink}
          onChange={(e) => setMapLink(e.target.value)}
          className="w-full box-border h-9 rounded-md border border-[#E4E9EC] px-2.5 text-xs"
        />
      </div>
      <div className="text-xs text-[#8A96A3] mb-4">
        Address, phone, email &amp; working hours are managed under Admin → Settings and are shared with the site header and footer.
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
