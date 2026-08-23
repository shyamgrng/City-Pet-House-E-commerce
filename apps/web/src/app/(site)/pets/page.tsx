"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import MediaSlot from "@/components/MediaSlot";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { usePets } from "@/context/PetContext";
import { useWishlist } from "@/context/WishlistContext";
import { coverPhoto, formatRs, petSpeciesList, type Pet } from "@/lib/pet-types";

const chips = ["All", ...petSpeciesList];

export default function PetsAvailablePage() {
  return (
    <Suspense fallback={null}>
      <PetsAvailableContent />
    </Suspense>
  );
}

function PetsAvailableContent() {
  const { pets, updatePet } = usePets();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [species, setSpecies] = useState(() => {
    const fromUrl = searchParams.get("species");
    return fromUrl && chips.includes(fromUrl) ? fromUrl : "All";
  });
  const [selected, setSelected] = useState<Pet | null>(null);

  const available = pets.filter((p) => p.status === "Available");
  const filtered = species === "All" ? available : available.filter((p) => p.species === species);

  const bookPuppy = (pet: Pet) => {
    if (!user) {
      router.push("/signin?redirect=/pets");
      return;
    }
    addItem({ id: pet.id, name: `${pet.breed} (Puppy)`, price: pet.price }, 1);
    updatePet(pet.id, { ...pet, status: "Reserved" });
    router.push("/cart");
  };

  const heart = (pet: Pet) => (
    <div
      onClick={(e) => {
        e.stopPropagation();
        toggle({ id: pet.id, kind: "pet", name: pet.breed, priceLabel: formatRs(pet.price), href: "/pets" });
      }}
      className="text-base cursor-pointer"
      style={{ color: has(pet.id, "pet") ? "#D64545" : "#C7CDD2" }}
    >
      {has(pet.id, "pet") ? "♥" : "♡"}
    </div>
  );

  if (selected) {
    const similar = available.filter((p) => p.species === selected.species && p.id !== selected.id).slice(0, 4);
    return (
      <div className="px-8 py-7">
        <div onClick={() => setSelected(null)} className="text-[13px] font-semibold text-primary cursor-pointer mb-4">
          ← Back to Pets Available
        </div>
        <div className="flex gap-7 flex-wrap mb-9">
          <div className="flex-1 min-w-[320px] max-w-[420px]">
            <div className="h-[300px] rounded-xl relative overflow-hidden mb-2.5">
              <MediaSlot src={coverPhoto(selected)} label="puppy photo" className="absolute inset-0 w-full h-full" />
              <div className="absolute top-2.5 left-2.5 bg-[#1F7A4D] text-white text-[10px] font-semibold px-2 py-1 rounded-md">
                {selected.status}
              </div>
            </div>
          </div>
          <div className="flex-1 min-w-[280px]">
            <div className="flex justify-between items-start gap-3">
              <div className="font-heading font-bold text-2xl text-[#1A2027]">{selected.breed}</div>
              {heart(selected)}
            </div>
            <div className="text-sm text-[#8A96A3] mt-1">
              {selected.sex} · {selected.age}
            </div>
            <div className="flex gap-1.5 flex-wrap my-3">
              {selected.tags.map((tag) => (
                <span key={tag} className="text-[11px] font-semibold text-[#1F7A4D] bg-[#E6F3EC] px-2 py-1 rounded-md">
                  {tag}
                </span>
              ))}
            </div>
            <div className="text-[22px] font-bold text-primary mb-0.5">{formatRs(selected.price)}</div>
            <div className="text-xs text-[#8A96A3] mb-[18px]">+ {formatRs(selected.deliveryFee)} delivery</div>
            <button
              onClick={() => bookPuppy(selected)}
              className="bg-primary text-white text-center px-6 py-3 rounded-[9px] text-sm font-semibold cursor-pointer max-w-[240px]"
            >
              Book Now
            </button>
          </div>
        </div>

        {similar.length > 0 && (
          <>
            <div className="font-heading font-bold text-base text-[#1A2027] mb-3.5">Other Puppies Available</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {similar.map((p) => (
                <div key={p.id} onClick={() => setSelected(p)} className="border border-[#E4E9EC] rounded-[10px] overflow-hidden cursor-pointer">
                  <MediaSlot src={coverPhoto(p)} label="puppy photo" className="h-[110px]" />
                  <div className="p-2.5">
                    <div className="text-xs font-semibold text-[#1A2027]">{p.breed}</div>
                    <div className="text-[11px] text-[#8A96A3] mt-0.5">
                      {p.sex} · {p.age}
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <div className="text-[13px] font-bold text-primary">{formatRs(p.price)}</div>
                      {heart(p)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="px-8 py-7">
      <div className="font-heading font-bold text-xl text-[#1A2027] mb-1.5">Pets Available for Sale</div>
      <div className="text-[13px] text-[#5B6773] mb-[18px]">Verified, healthy puppies ready to bring home.</div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {chips.map((c) => (
          <button
            key={c}
            onClick={() => setSpecies(c)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer"
            style={{ background: species === c ? "#1996C8" : "#F0F2F4", color: species === c ? "#fff" : "#5B6773" }}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-[#E4E9EC] rounded-[10px] p-10 text-center text-xs text-[#8A96A3]">
          No pets available in this category right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filtered.map((p) => (
            <div key={p.id} onClick={() => setSelected(p)} className="border border-[#E4E9EC] rounded-xl overflow-hidden cursor-pointer">
              <div className="h-[260px] relative">
                <MediaSlot src={coverPhoto(p)} label="puppy photo" className="absolute inset-0 w-full h-full" />
                <div className="absolute top-2 left-2 bg-[#1F7A4D] text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                  {p.status}
                </div>
                {p.video && (
                  <div className="absolute bottom-2 right-2 bg-black/55 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                    🎥 Video
                  </div>
                )}
              </div>
              <div className="p-3.5">
                <div className="flex justify-between items-start">
                  <div className="text-sm font-bold text-[#1A2027]">{p.breed}</div>
                  {heart(p)}
                </div>
                <div className="text-xs text-[#8A96A3] mt-0.5">
                  {p.sex} · {p.age}
                </div>
                <div className="flex gap-1.5 flex-wrap my-2">
                  {p.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-semibold text-[#1F7A4D] bg-[#E6F3EC] px-2 py-1 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-[15px] font-bold text-primary mb-0.5">{formatRs(p.price)}</div>
                <div className="text-[11px] text-[#8A96A3] mb-2.5">+ {formatRs(p.deliveryFee)} delivery</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    bookPuppy(p);
                  }}
                  className="w-full bg-primary text-white text-center py-2.5 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
