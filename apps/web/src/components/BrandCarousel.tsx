"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import MediaSlot from "./MediaSlot";

export default function BrandCarousel({ brands, images }: { brands: string[]; images: Record<string, string> }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

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
    const maxLeft = el.scrollWidth - el.clientWidth;
    const target = Math.max(0, Math.min(maxLeft, el.scrollLeft + dir * el.clientWidth));
    el.scrollTo({ left: target, behavior: "smooth" });
  };

  const showArrows = !(atStart && atEnd);

  return (
    <div className="px-8 pb-7">
      <div className="relative">
        <div
          ref={scrollerRef}
          onScroll={updateEdges}
          className="flex gap-3 overflow-x-auto py-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {brands.map((b) => (
            <Link
              key={b}
              href={`/shop?brand=${encodeURIComponent(b)}`}
              className="group flex flex-col items-center gap-2 cursor-pointer shrink-0 w-[88px] transition-transform duration-200 hover:scale-105"
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
