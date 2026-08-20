"use client";

import { use } from "react";
import Link from "next/link";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { useServices } from "@/context/ServiceContext";

export default function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { services, ready } = useServices();

  if (!ready) return null;

  const service = services.find((s) => s.id === id);

  if (!service) {
    return (
      <div className="px-8 py-10 text-center text-sm text-[#8A96A3]">
        Service not found. <Link href="/services" className="text-primary font-semibold">Back to Services</Link>
      </div>
    );
  }

  return (
    <div className="px-8 py-7 max-w-[800px]">
      <Link href="/services" className="text-[13px] text-primary font-semibold mb-4 inline-block">
        ← Back to Services
      </Link>
      <div className="text-xs text-[#8A96A3] mb-3.5">Home / Services / {service.name}</div>

      <div className="h-[260px] rounded-2xl relative overflow-hidden mb-5">
        <ImagePlaceholder label="service photo" className="absolute inset-0 w-full h-full" />
      </div>

      <div className="font-heading font-bold text-[22px] text-[#1A2027] mb-2.5 leading-tight">{service.seoTitle}</div>
      <div className="text-sm text-[#5B6773] leading-relaxed mb-[18px]">{service.longDesc}</div>

      <div className="flex gap-6 mb-5">
        <div>
          <div className="text-[11px] text-[#8A96A3] mb-1">Duration</div>
          <div className="text-sm font-semibold text-[#1A2027]">{service.duration}</div>
        </div>
        {service.price && (
          <div>
            <div className="text-[11px] text-[#8A96A3] mb-1">Price</div>
            <div className="text-sm font-semibold text-[#1A2027]">{service.price}</div>
          </div>
        )}
      </div>

      {service.schedule && service.schedule.length > 0 && (
        <>
          <div className="text-sm font-semibold text-[#1A2027] mb-2.5">Vaccination Schedule</div>
          <div className="border border-[#E4E9EC] rounded-[10px] overflow-hidden mb-5">
            {service.schedule.map((row, i) => (
              <div key={i} className="flex px-3.5 py-3 border-b border-[#EEF1F3] last:border-0 text-[13px]">
                <div className="flex-none w-[160px] font-semibold text-[#1A2027]">{row.age}</div>
                <div className="text-[#3A4652]">{row.vaccine}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="text-sm font-semibold text-[#1A2027] mb-2.5">Why Choose This Service</div>
      {service.benefits.map((b, i) => (
        <div key={i} className="text-[13px] text-[#3A4652] mb-2">
          ✅ {b}
        </div>
      ))}

      <button className="inline-block bg-primary text-white px-[26px] py-3.5 rounded-[9px] text-sm font-semibold cursor-pointer mt-2.5">
        Book Now
      </button>
    </div>
  );
}
