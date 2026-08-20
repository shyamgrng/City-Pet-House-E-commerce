"use client";

import Link from "next/link";
import { useState } from "react";
import { useFaq } from "@/context/FaqContext";

export default function FaqPage() {
  const { content, ready } = useFaq();
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  if (!ready) return null;

  const categories = ["All", ...Array.from(new Set(content.items.map((i) => i.cat)))];
  const q = search.trim().toLowerCase();
  const filtered = content.items.filter((it) => {
    if (category !== "All" && it.cat !== category) return false;
    if (q && !(it.q.toLowerCase().includes(q) || it.a.toLowerCase().includes(q))) return false;
    return true;
  });

  return (
    <div className="pb-12">
      <div style={{ background: "linear-gradient(135deg, #EAF4F9, #F3F9FC)" }} className="px-8 pt-11 pb-9">
        <Link href="/" className="text-[13px] text-primary font-semibold mb-4 inline-block">
          ← Back to Home
        </Link>
        <div className="font-heading font-bold text-[30px] text-[#1A2027] mb-3">{content.pageTitle}</div>
        <div className="text-sm text-[#3A4652] leading-[1.8] mb-5">{content.pageSubtitle}</div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search a question…"
          className="w-full max-w-[420px] box-border h-[46px] rounded-[9px] border border-[#D8E4EA] px-4 text-[13px] bg-white"
        />
      </div>

      <div className="max-w-[760px] mx-auto px-8 pt-9">
        <div className="flex gap-2 flex-wrap mb-[26px]">
          {categories.map((cat) => (
            <div
              key={cat}
              onClick={() => setCategory(cat)}
              className="px-4 py-2 rounded-full text-xs font-semibold cursor-pointer border border-[#E4E9EC]"
              style={cat === category ? { background: "#1996C8", color: "#fff" } : { background: "#fff", color: "#3A4652" }}
            >
              {cat}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-[13px] text-[#8A96A3] bg-[#F7F8F9] border border-dashed border-[#E4E9EC] rounded-[10px] p-6 text-center mb-6">
            No questions match your search.
          </div>
        )}

        {filtered.map((fq) => {
          const open = openId === fq.id;
          return (
            <div key={fq.id} className="border border-[#E4E9EC] rounded-xl mb-3 overflow-hidden">
              <div
                onClick={() => setOpenId(open ? null : fq.id)}
                className="px-[18px] py-4 flex justify-between items-center gap-3 cursor-pointer bg-white"
              >
                <div className="text-sm font-bold text-[#1A2027]">{fq.q}</div>
                <div className="text-base text-primary font-bold shrink-0">{open ? "−" : "+"}</div>
              </div>
              {open && <div className="px-[18px] pb-[18px] text-[13px] text-[#3A4652] leading-relaxed">{fq.a}</div>}
            </div>
          );
        })}

        <div className="bg-[#1A2027] rounded-2xl p-8 text-center mt-5">
          <div className="font-heading font-bold text-xl text-white mb-2">{content.contactHeading}</div>
          <div className="text-[13px] text-[#9BB0BE] mb-[18px]">{content.contactSubtext}</div>
          <div className="text-[13px] text-white leading-[2]">
            City Pet House &amp; Animal Clinic
            <br />
            info@citypethouse.com.np · +977-9851313717
            <br />
            Gokarneshwor Municipality–6, Kathmandu, Nepal
          </div>
        </div>
      </div>
    </div>
  );
}
