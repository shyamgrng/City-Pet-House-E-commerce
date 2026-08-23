"use client";

import Link from "next/link";
import ShopProductCard from "./ShopProductCard";
import { useCatalog } from "@/context/CatalogContext";

export default function ProductRail({
  title,
  category,
  seeAll = true,
  padBottom = "pb-7",
}: {
  title: string;
  category: string;
  seeAll?: boolean;
  padBottom?: string;
}) {
  const { products } = useCatalog();
  const items = products.filter((p) => p.category === category && p.status === "active").slice(0, 6);

  return (
    <div>
      <div className="px-8 pb-2.5 flex justify-between items-center">
        <div className="font-heading font-bold text-base text-[#1A2027]">{title}</div>
        {seeAll && (
          <Link href={`/shop?category=${encodeURIComponent(category)}`} className="text-xs text-primary font-semibold cursor-pointer">
            See all →
          </Link>
        )}
      </div>
      {items.length === 0 ? (
        <div className={`mx-8 ${padBottom} p-[22px] border border-dashed border-[#E4E9EC] rounded-[10px] text-center text-xs text-[#8A96A3]`}>
          No {category.toLowerCase()} products yet — add some in Admin → Shop.
        </div>
      ) : (
        <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 px-8 ${padBottom}`}>
          {items.map((p) => (
            <ShopProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
