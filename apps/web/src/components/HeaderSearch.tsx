"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { useBlog } from "@/context/BlogContext";
import { useCatalog } from "@/context/CatalogContext";
import { usePets } from "@/context/PetContext";
import { useServices } from "@/context/ServiceContext";

type Result = { key: string; kind: string; label: string; sub: string; href: string };

export default function HeaderSearch() {
  const { products } = useCatalog();
  const { pets } = usePets();
  const { services } = useServices();
  const { posts } = useBlog();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const out: Result[] = [];
    for (const p of products) {
      if (out.length >= 8) break;
      if (`${p.name} ${p.category} ${p.brand}`.toLowerCase().includes(q)) {
        out.push({ key: `product-${p.id}`, kind: "Product", label: p.name, sub: p.category, href: `/product/${p.id}` });
      }
    }
    for (const p of pets) {
      if (out.length >= 8) break;
      if (p.status === "Available" && `${p.breed} ${p.species}`.toLowerCase().includes(q)) {
        out.push({ key: `pet-${p.id}`, kind: "Pet", label: p.breed, sub: p.species, href: `/pets?species=${encodeURIComponent(p.species)}` });
      }
    }
    for (const s of services) {
      if (out.length >= 8) break;
      if (s.name.toLowerCase().includes(q)) {
        out.push({ key: `service-${s.id}`, kind: "Service", label: s.name, sub: "Service", href: `/services/${s.id}` });
      }
    }
    for (const post of posts) {
      if (out.length >= 8) break;
      if (post.title.toLowerCase().includes(q)) {
        out.push({ key: `blog-${post.id}`, kind: "Blog", label: post.title, sub: post.author, href: `/blog/${post.id}` });
      }
    }
    return out;
  }, [query, products, pets, services, posts]);

  const goSearch = () => {
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/shop?search=${encodeURIComponent(q)}`);
  };

  return (
    <div className="flex-1 h-[42px] rounded-lg bg-[#F7F9FA] border-[1.5px] border-primary flex items-center pl-3.5 pr-1.5 gap-2 relative">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          blurTimer.current = setTimeout(() => setOpen(false), 150);
        }}
        onKeyDown={(e) => e.key === "Enter" && goSearch()}
        placeholder="Search for dog food, vet booking, puppies…"
        className="flex-1 text-[13px] text-[#1A2027] bg-transparent outline-none h-full"
      />
      <button onClick={goSearch} className="bg-primary text-white h-8 px-[18px] rounded-md flex items-center text-xs font-semibold shrink-0 cursor-pointer">
        Search
      </button>

      {open && results.length > 0 && (
        <div className="absolute top-[46px] left-0 right-0 bg-white border border-[#E4E9EC] rounded-lg shadow-[0_8px_20px_rgba(0,0,0,0.1)] overflow-hidden z-20">
          {results.map((r) => (
            <Link
              key={r.key}
              href={r.href}
              onClick={() => {
                if (blurTimer.current) clearTimeout(blurTimer.current);
                setOpen(false);
                setQuery("");
              }}
              className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#F0F2F4] last:border-0 hover:bg-[#F7F9FA]"
            >
              <div>
                <div className="text-[13px] text-[#1A2027] font-medium">{r.label}</div>
                <div className="text-[11px] text-[#8A96A3]">{r.sub}</div>
              </div>
              <div className="text-[10px] font-bold text-primary bg-[#EAF4F9] px-2 py-0.5 rounded-full shrink-0 ml-2">{r.kind}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
