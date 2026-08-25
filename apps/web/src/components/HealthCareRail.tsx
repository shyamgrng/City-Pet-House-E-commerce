"use client";

import Image from "next/image";
import Link from "next/link";
import { useServices } from "@/context/ServiceContext";
import { findServiceByKeyword } from "@/lib/service-types";

const items = [
  { icon: "/assets/icon-microchipping.png", title: "Microchipping", desc: "Ensure your contact details are always with your pet.", keyword: "microchip" },
  { icon: "/assets/icon-vaccinations.png", title: "Vaccinations", desc: "Protect your pet from common infectious diseases.", keyword: "vaccination" },
  { icon: "/assets/icon-desexing.png", title: "Desexing", desc: "Prevent unwanted pregnancies and reduce health risks.", keyword: "surgery" },
  { icon: "/assets/icon-surgery.png", title: "Clinical Surgery", desc: "Expert surgical care backed by experienced vets.", keyword: "surgery" },
  { icon: "/assets/icon-grooming.png", title: "Pet Grooming", desc: "Keep your pet looking and feeling their very best.", keyword: "grooming" },
];

export default function HealthCareRail() {
  const { services } = useServices();

  return (
    <div className="flex flex-wrap gap-4">
      {items.map((item) => {
        const service = findServiceByKeyword(services, item.keyword);
        return (
          <Link
            key={item.title}
            href={service ? `/services/${service.id}` : "/services"}
            className="flex-1 min-w-[150px] text-center cursor-pointer transition-transform duration-200 hover:scale-105"
          >
            <div className="w-[104px] h-[104px] rounded-full flex items-center justify-center mx-auto mb-4 bg-[#E7EFEC] overflow-hidden">
              <Image src={item.icon} alt={item.title} width={104} height={104} className="object-contain w-full h-full" />
            </div>
            <div className="font-heading font-bold text-[17px] text-[#12181D] mb-2">{item.title}</div>
            <div className="text-[13px] text-[#3A4450] leading-relaxed mb-3.5">{item.desc}</div>
          </Link>
        );
      })}
    </div>
  );
}
