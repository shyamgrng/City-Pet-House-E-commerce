"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type WheelEvent } from "react";
import MediaSlot from "@/components/MediaSlot";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { usePets } from "@/context/PetContext";
import { useWishlist } from "@/context/WishlistContext";
import { coverPhoto, coverPhotoAlt, dewormStages, formatRs, petSpeciesList, vaccineStages, type Pet } from "@/lib/pet-types";

const chips = ["All", ...petSpeciesList];

const OTHER_ANIMALS_LABELS: Record<string, string> = {
  Dog: "Other Puppies Available",
  Cat: "Other Kittens Available",
  "Small Pets": "Other Small Pets Available",
  Birds: "Other Birds Available",
  Fish: "Other Fish Available",
};

function otherAnimalsLabel(species: string): string {
  return OTHER_ANIMALS_LABELS[species] ?? "Other Pets Available";
}

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
  const [activePhoto, setActivePhoto] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [urlIdApplied, setUrlIdApplied] = useState(false);

  const available = pets.filter((p) => p.status === "Available");
  const filtered = species === "All" ? available : available.filter((p) => p.species === species);

  const selectPet = (p: Pet) => {
    setSelected(p);
    const filled = p.photos.map((src, i) => ({ src, i })).filter((x) => x.src);
    const coverPos = filled.findIndex((x) => x.i === p.coverPhotoIndex);
    setActivePhoto(coverPos >= 0 ? coverPos : 0);
    setZoomOpen(false);
  };

  // Opens straight to a specific pet's detail view when linked here with ?id=<petId>
  // (e.g. clicking a puppy card on the homepage) instead of always landing on the grid.
  useEffect(() => {
    if (urlIdApplied || pets.length === 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration of the ?id= query param once pet data is loaded
    setUrlIdApplied(true);
    const id = searchParams.get("id");
    const match = id ? pets.find((p) => p.id === id) : undefined;
    if (match) selectPet(match);
  }, [pets, searchParams, urlIdApplied]);

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
    const similar = available.filter((p) => p.species === selected.species && p.id !== selected.id).slice(0, 8);
    const photoEntries = selected.photos.map((src, i) => ({ src, i })).filter((p) => p.src);
    const galleryItems: ({ kind: "photo"; src: string; photoIndex: number } | { kind: "video"; src: string })[] = [
      ...photoEntries.map((p) => ({ kind: "photo" as const, src: p.src, photoIndex: p.i })),
      ...(selected.video ? [{ kind: "video" as const, src: selected.video }] : []),
    ];
    const activeIndex = Math.min(activePhoto, Math.max(0, galleryItems.length - 1));
    const activeItem = galleryItems[activeIndex];
    const photoOnlyItems = galleryItems.filter((g) => g.kind === "photo");
    const activePhotoOnlyIndex =
      activeItem?.kind === "photo" ? photoOnlyItems.findIndex((p) => p.kind === "photo" && p.photoIndex === activeItem.photoIndex) : -1;
    const heroSrc = activeItem?.kind === "photo" ? activeItem.src : coverPhoto(selected);
    const heroAlt = (activeItem?.kind === "photo" ? selected.photoAlts[activeItem.photoIndex] : coverPhotoAlt(selected)) || selected.breed;

    const openZoom = () => {
      if (activeItem?.kind !== "photo") return;
      setZoomScale(1);
      setZoomOpen(true);
    };
    const closeZoom = () => setZoomOpen(false);
    const jumpToPhoto = (dir: 1 | -1) => {
      if (photoOnlyItems.length < 2 || activePhotoOnlyIndex < 0) return;
      const nextPhoto = photoOnlyItems[(activePhotoOnlyIndex + dir + photoOnlyItems.length) % photoOnlyItems.length];
      const idx = galleryItems.findIndex((g) => g.kind === "photo" && nextPhoto.kind === "photo" && g.photoIndex === nextPhoto.photoIndex);
      if (idx >= 0) setActivePhoto(idx);
      setZoomScale(1);
    };
    const handleWheelZoom = (e: WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      setZoomScale((s) => Math.min(3, Math.max(1, s - e.deltaY * 0.001)));
    };

    return (
      <div className="px-8 py-7">
        <div onClick={() => setSelected(null)} className="text-[13px] font-semibold text-primary cursor-pointer mb-4">
          ← Back to Pets Available
        </div>
        <div className="flex gap-7 flex-wrap mb-9">
          <div className="flex-1 min-w-[320px] max-w-[420px]">
            <div className="h-[300px] rounded-xl relative overflow-hidden mb-2.5 bg-black/5">
              {activeItem?.kind === "video" ? (
                <video src={activeItem.src} controls autoPlay className="absolute inset-0 w-full h-full object-contain bg-black" />
              ) : (
                <div onClick={openZoom} className="absolute inset-0 cursor-zoom-in">
                  <MediaSlot src={heroSrc} label={heroAlt} className="absolute inset-0 w-full h-full" />
                </div>
              )}
              <div className="absolute top-2.5 left-2.5 bg-[#1F7A4D] text-white text-[10px] font-semibold px-2 py-1 rounded-md">
                {selected.status}
              </div>
            </div>
            {galleryItems.length > 1 && (
              <div className="flex gap-2">
                {galleryItems.map((g, i) => (
                  <button
                    key={g.kind === "photo" ? `photo-${g.photoIndex}` : "video"}
                    onClick={() => setActivePhoto(i)}
                    className="w-16 h-16 rounded-lg overflow-hidden relative cursor-pointer shrink-0"
                    style={{ outline: activeIndex === i ? "2px solid #1996C8" : "1px solid #E4E9EC", outlineOffset: "-1px" }}
                  >
                    {g.kind === "video" ? (
                      <div className="absolute inset-0 bg-[#1A2027] flex items-center justify-center text-white text-base">▶️</div>
                    ) : (
                      <MediaSlot
                        src={g.src}
                        label={(g.kind === "photo" ? selected.photoAlts[g.photoIndex] : "") || `photo ${i + 1}`}
                        className="absolute inset-0 w-full h-full"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}

            {zoomOpen && activeItem?.kind === "photo" && (
              <div
                onClick={closeZoom}
                className="fixed inset-0 z-[9999] flex items-center justify-center p-10"
                style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
              >
                <div onClick={(e) => e.stopPropagation()} className="relative max-w-[900px] w-full">
                  <div
                    onClick={closeZoom}
                    className="absolute -top-4 -right-4 w-[34px] h-[34px] rounded-full bg-white shadow-lg flex items-center justify-center text-lg text-[#1A2027] cursor-pointer z-[2]"
                  >
                    ×
                  </div>
                  <div onWheel={handleWheelZoom} className="h-[70vh] flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded data: URL, zoomed via inline transform */}
                    <img
                      src={activeItem.src}
                      alt={heroAlt}
                      className="max-w-full max-h-full object-contain"
                      style={{ transform: `scale(${zoomScale})`, transition: "transform 0.15s" }}
                    />
                  </div>
                  {photoOnlyItems.length > 1 && (
                    <>
                      <div
                        onClick={() => jumpToPhoto(-1)}
                        className="absolute top-1/2 left-2.5 -translate-y-1/2 w-[34px] h-[34px] rounded-full bg-white shadow-lg flex items-center justify-center text-base cursor-pointer"
                      >
                        ‹
                      </div>
                      <div
                        onClick={() => jumpToPhoto(1)}
                        className="absolute top-1/2 right-2.5 -translate-y-1/2 w-[34px] h-[34px] rounded-full bg-white shadow-lg flex items-center justify-center text-base cursor-pointer"
                      >
                        ›
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
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
              {selected.tags
                .filter((tag) => tag !== "Vaccinated" && tag !== "Dewormed")
                .map((tag) => (
                  <span key={tag} className="text-[11px] font-semibold text-[#1F7A4D] bg-[#E6F3EC] px-2 py-1 rounded-md">
                    {tag}
                  </span>
                ))}
            </div>
            {(selected.vaccinations.some(Boolean) || selected.dewormings.some(Boolean)) && (
              <div className="flex gap-1.5 flex-wrap mb-3">
                {selected.vaccinations.some(Boolean) && (
                  <span className="text-[11px] font-semibold text-[#146A8C] bg-[#EAF4F9] px-2 py-1 rounded-md">
                    💉 Vaccinated {selected.vaccinations.filter(Boolean).length}/{vaccineStages.length} doses
                  </span>
                )}
                {selected.dewormings.some(Boolean) && (
                  <span className="text-[11px] font-semibold text-[#8A6D1F] bg-[#FFF8E8] px-2 py-1 rounded-md">
                    🪱 Dewormed {selected.dewormings.filter(Boolean).length}/{dewormStages.length} doses
                  </span>
                )}
              </div>
            )}
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
            <div className="font-heading font-bold text-base text-[#1A2027] mb-3.5">{otherAnimalsLabel(selected.species)}</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {similar.map((p) => (
                <div key={p.id} onClick={() => selectPet(p)} className="rounded-[10px] overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg">
                  <MediaSlot src={coverPhoto(p)} label={coverPhotoAlt(p) || p.breed} className="aspect-square" />
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <div key={p.id} onClick={() => selectPet(p)} className="rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg">
              <div className="aspect-square relative">
                <MediaSlot src={coverPhoto(p)} label={coverPhotoAlt(p) || p.breed} className="absolute inset-0 w-full h-full" />
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
                  {p.tags
                    .filter((tag) => tag !== "Vaccinated" && tag !== "Dewormed")
                    .map((tag) => (
                      <span key={tag} className="text-[10px] font-semibold text-[#1F7A4D] bg-[#E6F3EC] px-2 py-1 rounded-md">
                        {tag}
                      </span>
                    ))}
                  {p.vaccinations.some(Boolean) && (
                    <span className="text-[10px] font-semibold text-[#146A8C] bg-[#EAF4F9] px-2 py-1 rounded-md">💉 Vaccinated</span>
                  )}
                  {p.dewormings.some(Boolean) && (
                    <span className="text-[10px] font-semibold text-[#8A6D1F] bg-[#FFF8E8] px-2 py-1 rounded-md">🪱 Dewormed</span>
                  )}
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
