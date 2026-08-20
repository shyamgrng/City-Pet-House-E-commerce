"use client";

import { use } from "react";
import Link from "next/link";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { useDogBreeds } from "@/context/DogBreedContext";

export default function DogBreedDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { breeds, ready } = useDogBreeds();

  if (!ready) return null;

  const breed = breeds.find((b) => b.id === id);

  if (!breed) {
    return (
      <div className="px-8 py-10 text-center text-sm text-[#8A96A3]">
        Breed not found.{" "}
        <Link href="/dog-breed-archive" className="text-primary font-semibold">
          Back to Dog Breed Archive
        </Link>
      </div>
    );
  }

  return (
    <div className="px-8 py-7 max-w-[900px]">
      <Link href="/dog-breed-archive" className="text-[13px] text-primary font-semibold mb-4 inline-block">
        ← Back to Dog Breed Archive
      </Link>
      <div className="flex gap-7 flex-wrap">
        <ImagePlaceholder label="dog photo" className="w-[336px] h-[264px] shrink-0 rounded-xl" />
        <div className="flex-1 min-w-[280px]">
          <div className="font-heading font-bold text-2xl text-[#1A2027] mb-1">{breed.name}</div>
          <div className="text-[13px] text-[#8A96A3] mb-4">Origin: {breed.origin}</div>
          <div className="text-sm text-[#3A4652] leading-[1.7] mb-[18px]">{breed.description}</div>
          <div className="grid grid-cols-2 gap-3.5">
            <Stat label="Size" value={breed.size} />
            <Stat label="Lifespan" value={breed.lifespan} />
            <Stat label="Coat" value={breed.coat} />
            <Stat label="Exercise Needs" value={breed.exercise} />
            <Stat label="Grooming" value={breed.grooming} />
            <Stat label="Good With" value={breed.goodWith} />
          </div>
        </div>
      </div>
      <div className="mt-6 p-[18px] bg-[#F7F9FA] rounded-xl">
        <div className="text-xs font-bold text-[#1A2027] mb-1.5">Temperament</div>
        <div className="text-[13px] text-[#3A4652] leading-relaxed">{breed.temperament}</div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-[#8A96A3] mb-0.5">{label}</div>
      <div className="text-[13px] font-semibold text-[#1A2027]">{value}</div>
    </div>
  );
}
