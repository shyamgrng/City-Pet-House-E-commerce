"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import MediaSlot from "./MediaSlot";

const VISIBLE_COUNT = 7;
const ITEM_WIDTH = 88;
const GAP = 16;
const ROW_WIDTH = VISIBLE_COUNT * ITEM_WIDTH + (VISIBLE_COUNT - 1) * GAP;

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
    scrollerRef.current?.scrollBy({ left: dir * ROW_WIDTH, behavior: "smooth" });
  };

  const showArrows = brands.length > VISIBLE_COUNT;

  return (
    <div className="px-8 pb-7">
      <div className="relative" style={{ maxWidth: ROW_WIDTH }}>
        <div
          ref={scrollerRef}
          onScroll={updateEdges}
          className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ gap: GAP }}
        >
          {brands.map((b) => (
            <Link
              key={b}
              href={`/shop?brand=${encodeURIComponent(b)}`}
              className="flex flex-col items-center gap-2 cursor-pointer shrink-0 snap-start"
              style={{ width: ITEM_WIDTH }}
            >
              <MediaSlot src={images[b]} label={b} shape="circle" className="w-[88px] h-[88px]" />
              <div className="text-[11px] font-semibold text-[#1A2027] text-center truncate w-full">{b}</div>
            </Link>
          ))}
        </div>
        {showArrows && !atStart && (
          <button
            onClick={() => scrollByPage(-1)}
            aria-label="Previous brands"
            className="absolute -left-4 top-11 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.18)] border border-[#E4E9EC] flex items-center justify-center text-sm text-[#1A2027] cursor-pointer"
          >
            ‹
          </button>
        )}
        {showArrows && !atEnd && (
          <button
            onClick={() => scrollByPage(1)}
            aria-label="Next brands"
            className="absolute -right-4 top-11 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.18)] border border-[#E4E9EC] flex items-center justify-center text-sm text-[#1A2027] cursor-pointer"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}
