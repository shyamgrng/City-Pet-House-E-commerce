"use client";

import Link from "next/link";
import { useState } from "react";
import { useTestimonials } from "@/context/TestimonialContext";

export default function AdminTestimonialsPage() {
  const { testimonials, addTestimonial, updateTestimonial, removeTestimonial } = useTestimonials();
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
      <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-1.5">Testimonials</div>
      <div className="text-xs text-[#5B6773] mb-[18px]">Customer quotes shown in the &quot;Our Happy Customers&quot; section on Home.</div>

      {testimonials.map((t) => (
        <div key={t.id} className="bg-white border border-[#E4E9EC] rounded-[10px] p-4 mb-2.5">
          <div className="flex justify-between items-start gap-2 mb-2">
            <div className="text-[11px] font-bold text-[#8A96A3]">QUOTE</div>
            <div onClick={() => removeTestimonial(t.id)} className="text-[11px] font-semibold text-[#D64545] cursor-pointer whitespace-nowrap">
              Delete
            </div>
          </div>
          <textarea
            value={t.quote}
            onChange={(e) => updateTestimonial(t.id, { quote: e.target.value, name: t.name })}
            rows={3}
            className="w-full box-border rounded-md border border-[#E4E9EC] px-2.5 py-2 text-xs resize-y font-sans mb-2.5"
          />
          <div className="text-[11px] font-bold text-[#8A96A3] mb-1.5">CUSTOMER NAME</div>
          <input
            value={t.name}
            onChange={(e) => updateTestimonial(t.id, { quote: t.quote, name: e.target.value })}
            className="w-full box-border h-9 rounded-md border border-[#E4E9EC] px-2.5 text-xs font-semibold"
          />
        </div>
      ))}
      <div
        onClick={() => addTestimonial({ quote: "New testimonial quote.", name: "Customer Name" })}
        className="text-xs font-semibold text-primary cursor-pointer mb-[18px]"
      >
        + Add Testimonial
      </div>

      <button onClick={update} className="bg-primary text-white text-center px-5 py-3 rounded-[9px] text-sm font-semibold cursor-pointer max-w-[180px]">
        Update
      </button>
      {saved && <div className="text-xs text-[#1F7A4D] mt-2.5">✓ Saved</div>}
    </div>
  );
}
