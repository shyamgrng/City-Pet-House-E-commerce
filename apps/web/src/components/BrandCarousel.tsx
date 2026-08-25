"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import MediaSlot from "./MediaSlot";

const VISIBLE_COUNT = 7;

function chunk(items: string[], size: number): string[][] {
  const pages: string[][] = [];
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size));
  return pages;
}

export default function BrandCarousel({ brands, images }: { brands: string[]; images: Record<string, string> }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const pages = chunk(brands, VISIBLE_COUNT);

  const updateEdges = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  };

  useEffect(() => {
    updateEdges();
  }, [brands.length]);

  const scrollByPage = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  const showArrows = pages.length > 1;

  return (
    <div className="px-8 pb-7">
      <div className="relative">
        <div
          ref={scrollerRef}
          onScroll={updateEdges}
          className="flex overflow-x-auto py-2 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {pages.map((page, i) => (
            <div key={i} className="grid grid-cols-7 gap-3 w-full shrink-0 snap-start">
              {page.map((b) => (
                <Link
                  key={b}
                  href={`/shop?brand=${encodeURIComponent(b)}`}
                  className="group flex flex-col items-center gap-2 cursor-pointer transition-transform duration-200 hover:scale-105"
                >
                  <MediaSlot
                    src={images[b]}
                    label={b}
                    shape="circle"
                    className="w-[88px] h-[88px] transition-shadow duration-200 group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.28)]"
                  />
                  <div className="text-[11px] font-semibold text-[#1A2027] text-center truncate w-full">{b}</div>
                </Link>
              ))}
            </div>
          ))}
        </div>
        {showArrows && !atStart && (
          <button
            onClick={() => scrollByPage(-1)}
            aria-label="Previous brands"
            className="absolute -left-4 top-[52px] -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.18)] border border-[#E4E9EC] flex items-center justify-center text-sm text-[#1A2027] cursor-pointer"
          >
            ‹
          </button>
        )}
        {showArrows && !atEnd && (
          <button
            onClick={() => scrollByPage(1)}
            aria-label="Next brands"
            className="absolute -right-4 top-[52px] -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.18)] border border-[#E4E9EC] flex items-center justify-center text-sm text-[#1A2027] cursor-pointer"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}
