"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import ShopProductCard from "@/components/ShopProductCard";
import { useCatalog } from "@/context/CatalogContext";
import { brandNames, shopCategories, type Product } from "@/lib/catalog-types";

const ratingOptions = [5, 4, 3, 2];
const priceRangeOptions: { label: string; min: number; max: number }[] = [
  { label: "Under Rs. 500", min: 0, max: 500 },
  { label: "Rs. 500 – 1,500", min: 500, max: 1500 },
  { label: "Rs. 1,500 – 5,000", min: 1500, max: 5000 },
  { label: "Rs. 5,000+", min: 5000, max: Infinity },
];

function aiSearch(products: Product[], query: string): string[] {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (!tokens.length) return [];
  const scored = products
    .map((p) => {
      const haystack = `${p.name} ${p.category} ${p.brand}`.toLowerCase();
      const score = tokens.reduce((acc, t) => (haystack.includes(t) ? acc + 1 : acc), 0);
      return { name: p.name, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, 12).map((s) => s.name);
}

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const { products: allProducts } = useCatalog();
  const products = useMemo(() => allProducts.filter((p) => p.status === "active"), [allProducts]);
  const searchParams = useSearchParams();
  const [category, setCategory] = useState<string>(() => {
    const fromUrl = searchParams.get("category");
    return fromUrl && shopCategories.includes(fromUrl) ? fromUrl : "";
  });
  const [brand, setBrand] = useState<string>(() => {
    const fromUrl = searchParams.get("brand");
    return fromUrl && brandNames.includes(fromUrl) ? fromUrl : "";
  });
  const [rating, setRating] = useState<number>(0);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiNote, setAiNote] = useState("");
  const [aiResultNames, setAiResultNames] = useState<string[] | null>(null);

  const filtered = useMemo(() => {
    if (aiResultNames) {
      const set = new Set(aiResultNames);
      return products.filter((p) => set.has(p.name));
    }
    return products.filter((p) => {
      if (brand && p.brand !== brand) return false;
      if (category && p.category !== category) return false;
      if (rating > 0) return false; // no per-product rating data in the catalog yet
      if (priceRange && !(p.price >= priceRange.min && p.price < priceRange.max)) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!`${p.name} ${p.category} ${p.brand}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [products, brand, category, rating, priceRange, search, aiResultNames]);

  const runAskAi = () => {
    const q = search.trim();
    if (!q) return;
    setAiBusy(true);
    setAiNote("");
    window.setTimeout(() => {
      const names = aiSearch(products, q);
      setAiResultNames(names);
      setAiBusy(false);
      setAiNote(names.length ? `✨ AI found ${names.length} match${names.length === 1 ? "" : "es"} for "${q}"` : `✨ AI found no matches for "${q}"`);
    }, 400);
  };

  const clearAi = () => {
    setAiResultNames(null);
    setAiNote("");
  };

  return (
    <div className="flex gap-6 px-8 py-7">
      <div className="w-[200px] shrink-0">
        <div className="font-heading font-bold text-sm text-[#1A2027] mb-3">Categories</div>
        {shopCategories.map((c) => (
          <div
            key={c}
            onClick={() => setCategory(category === c ? "" : c)}
            className="text-[13px] py-2 border-b border-[#F0F2F4] cursor-pointer"
            style={{ fontWeight: category === c ? 700 : 400, color: category === c ? "#1996C8" : "#3A4652" }}
          >
            {c}
          </div>
        ))}

        <div className="font-heading font-bold text-sm text-[#1A2027] mt-[18px] mb-3">Brand</div>
        {brandNames.map((b) => (
          <div
            key={b}
            onClick={() => setBrand(brand === b ? "" : b)}
            className="text-[13px] py-2 border-b border-[#F0F2F4] cursor-pointer"
            style={{ fontWeight: brand === b ? 700 : 400, color: brand === b ? "#1996C8" : "#3A4652" }}
          >
            {b}
          </div>
        ))}

        <div className="font-heading font-bold text-sm text-[#1A2027] mt-[18px] mb-3">Rating</div>
        {ratingOptions.map((n) => (
          <div
            key={n}
            onClick={() => setRating(rating === n ? 0 : n)}
            className="text-[13px] py-2 border-b border-[#F0F2F4] cursor-pointer"
            style={{ fontWeight: rating === n ? 700 : 400, color: rating === n ? "#1996C8" : "#3A4652" }}
          >
            {"★".repeat(n) + "☆".repeat(5 - n)} {n} &amp; up
          </div>
        ))}

        <div className="font-heading font-bold text-sm text-[#1A2027] mt-[18px] mb-3">Price</div>
        {priceRangeOptions.map((pr) => (
          <div
            key={pr.label}
            onClick={() => setPriceRange(priceRange?.min === pr.min ? null : { min: pr.min, max: pr.max })}
            className="text-[13px] py-2 border-b border-[#F0F2F4] cursor-pointer"
            style={{ fontWeight: priceRange?.min === pr.min ? 700 : 400, color: priceRange?.min === pr.min ? "#1996C8" : "#3A4652" }}
          >
            {pr.label}
          </div>
        ))}
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-center mb-4">
          <div className="font-heading font-bold text-xl text-[#1A2027]">Shop</div>
          <div className="flex gap-2">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (aiResultNames) clearAi();
              }}
              placeholder="Search products…"
              className="w-[220px] h-9 rounded-lg bg-[#F7F9FA] border border-[#E4E9EC] px-3 text-xs box-border"
            />
            <button
              onClick={runAskAi}
              className="h-9 px-3.5 rounded-lg bg-[#7A56C8] text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              ✨ {aiBusy ? "Thinking…" : "Ask AI"}
            </button>
          </div>
        </div>

        {aiNote && (
          <div className="text-xs text-[#7A56C8] mb-3 flex items-center gap-2">
            {aiNote} <span onClick={clearAi} className="text-[#D64545] cursor-pointer font-semibold">Clear ✕</span>
          </div>
        )}

        {!aiNote && (brand || category) && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {brand && (
              <>
                <span className="text-xs text-[#5B6773]">Filtered by brand:</span>
                <span className="bg-[#EAF4F9] text-primary text-xs font-semibold px-3 py-1.5 rounded-full">{brand}</span>
                <span onClick={() => setBrand("")} className="text-xs text-[#D64545] cursor-pointer">Clear ✕</span>
              </>
            )}
            {category && (
              <>
                <span className="text-xs text-[#5B6773]">Filtered by category:</span>
                <span className="bg-[#EAF4F9] text-primary text-xs font-semibold px-3 py-1.5 rounded-full">{category}</span>
                <span onClick={() => setCategory("")} className="text-xs text-[#D64545] cursor-pointer">Clear ✕</span>
              </>
            )}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="border border-dashed border-[#E4E9EC] rounded-[10px] p-10 text-center text-xs text-[#8A96A3]">
            No products match these filters.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {filtered.map((p) => (
              <ShopProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
