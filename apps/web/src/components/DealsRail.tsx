"use client";

import Link from "next/link";
import ShopProductCard from "./ShopProductCard";
import { useCatalog } from "@/context/CatalogContext";
import { isDealLive } from "@/lib/catalog-types";

export default function DealsRail() {
  const { products } = useCatalog();
  const deals = products.filter((p) => p.status === "active" && isDealLive(p)).slice(0, 6);

  return (
    <div>
      <div className="px-8 pb-2.5 flex justify-between items-center">
        <div className="font-heading font-bold text-base text-[#1A2027]">Today&apos;s Deals</div>
        <Link href="/shop" className="text-xs text-primary font-semibold cursor-pointer">
          See all →
        </Link>
      </div>
      {deals.length === 0 ? (
        <div className="mx-8 mb-8 p-[22px] border border-dashed border-[#E4E9EC] rounded-[10px] text-center text-xs text-[#8A96A3]">
          No deals running right now — tick &quot;Today&apos;s Deal&quot; on a product in Admin → Shop to feature it here.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 px-8 pb-8">
          {deals.map((p) => (
            <ShopProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
