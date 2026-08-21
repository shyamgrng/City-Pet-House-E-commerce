"use client";

import { useTestimonials } from "@/context/TestimonialContext";

export default function TestimonialsRail() {
  const { testimonials } = useTestimonials();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 px-8 pb-7">
      {testimonials.map((t) => (
        <div key={t.id} className="border border-[#E4E9EC] rounded-[10px] p-4">
          <div className="text-xs text-[#3A4652] leading-relaxed mb-2.5">&quot;{t.quote}&quot;</div>
          <div className="text-xs font-semibold text-[#1A2027]">{t.name}</div>
        </div>
      ))}
    </div>
  );
}
