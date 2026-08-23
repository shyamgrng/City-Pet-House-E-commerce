"use client";

import Link from "next/link";
import MediaSlot from "./MediaSlot";
import { usePets } from "@/context/PetContext";
import { useWishlist } from "@/context/WishlistContext";
import { coverPhoto, formatRs } from "@/lib/pet-types";

export default function AvailablePuppiesRail() {
  const { pets } = usePets();
  const { has, toggle } = useWishlist();
  const available = pets.filter((p) => p.status === "Available").slice(0, 6);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 px-8 pb-8">
      {available.map((p) => (
        <Link key={p.id} href="/pets" className="block border border-[#E4E9EC] rounded-[10px] overflow-hidden">
          <div className="h-[100px] relative">
            <MediaSlot src={coverPhoto(p)} label="puppy photo" className="absolute inset-0 w-full h-full" />
            <div className="absolute top-1.5 left-1.5 bg-[#1F7A4D] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
              Available
            </div>
          </div>
          <div className="p-2.5">
            <div className="text-xs text-[#1A2027] font-semibold">{p.breed}</div>
            <div className="text-[11px] text-[#8A96A3] mt-0.5">
              {p.sex} · {p.age}
            </div>
            <div className="flex justify-between items-center mt-1">
              <div className="text-[13px] font-bold text-primary">{formatRs(p.price)}</div>
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggle({ id: p.id, kind: "pet", name: p.breed, priceLabel: formatRs(p.price), href: "/pets" });
                }}
                className="text-sm cursor-pointer"
                style={{ color: has(p.id, "pet") ? "#D64545" : "#C7CDD2" }}
              >
                {has(p.id, "pet") ? "♥" : "♡"}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
