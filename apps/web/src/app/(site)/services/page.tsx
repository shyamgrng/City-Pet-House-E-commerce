"use client";

import Link from "next/link";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { useServices } from "@/context/ServiceContext";

export default function ServicesPage() {
  const { services, ready } = useServices();

  if (!ready) return null;

  return (
    <div className="px-8 py-7">
      <div className="font-heading font-bold text-xl text-[#1A2027] mb-1.5">Our Services</div>
      <div className="text-[13px] text-[#5B6773] mb-5">Complete pet care under one roof — from routine checkups to emergency treatment.</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((svc) => (
          <div key={svc.id} className="border border-[#E4E9EC] rounded-xl overflow-hidden">
            <Link href={`/services/${svc.id}`} className="block h-[190px] relative cursor-pointer">
              <ImagePlaceholder label="service photo" className="absolute inset-0 w-full h-full" />
            </Link>
            <div className="p-[18px]">
              <Link href={`/services/${svc.id}`} className="block text-base font-bold text-[#1A2027] mb-2 cursor-pointer">
                {svc.name}
              </Link>
              <div className="text-[13px] text-[#5B6773] leading-relaxed mb-3.5">{svc.desc}</div>
              <Link
                href={`/services/${svc.id}`}
                className="block bg-white text-primary border border-primary text-center py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer mb-2"
              >
                View Details
              </Link>
              <button className="w-full bg-primary text-white text-center py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer">
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
