"use client";

import Link from "next/link";
import MediaSlot from "@/components/MediaSlot";
import { useDogBreeds } from "@/context/DogBreedContext";

export default function DogBreedArchivePage() {
  const { breeds, ready } = useDogBreeds();

  if (!ready) return null;

  return (
    <div className="px-8 py-7">
      <Link href="/" className="text-[13px] text-primary font-semibold mb-3.5 inline-block">
        ← Back to Home
      </Link>
      <div className="font-heading font-bold text-[22px] text-[#1A2027] mb-1.5">Dog Breed Archive</div>
      <div className="text-[13px] text-[#5B6773] mb-[22px] max-w-[640px]">
        A reference guide to dog breeds we commonly see at City Pet House — temperament, care needs, and what kind of home each one suits best.
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[18px]">
        {breeds.map((b) => (
          <Link key={b.id} href={`/dog-breed-archive/${b.id}`} className="border border-[#E4E9EC] rounded-xl overflow-hidden block">
            <MediaSlot src={b.photo} label="dog photo" className="w-full h-[150px]" />
            <div className="p-3.5">
              <div className="text-[13px] font-bold text-[#1A2027]">{b.name}</div>
              <div className="text-[11px] text-[#8A96A3] mt-0.5">{b.size}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
