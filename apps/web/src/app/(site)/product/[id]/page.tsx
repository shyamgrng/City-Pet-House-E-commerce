"use client";

import { use } from "react";
import Link from "next/link";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import ShopProductCard from "@/components/ShopProductCard";
import { useCatalog } from "@/context/CatalogContext";
import { badgeColor, formatRs, salePrice } from "@/lib/catalog-types";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { products } = useCatalog();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="px-8 py-10 text-center text-sm text-[#8A96A3]">
        Product not found. <Link href="/shop" className="text-primary font-semibold">Back to Shop</Link>
      </div>
    );
  }

  const similar = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 5);

  return (
    <div>
      <div className="flex gap-8 px-8 py-7">
        <div className="flex-1">
          <div className="h-[380px] rounded-2xl relative overflow-hidden mb-2.5">
            <ImagePlaceholder label="product gallery" className="absolute inset-0 w-full h-full" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-heading font-bold text-2xl text-[#1A2027]">{product.name}</div>
          <div className="flex gap-2 mt-2">
            {product.badge && (
              <span
                className="text-[10px] font-bold text-white px-2.5 py-1 rounded-full inline-block"
                style={{ background: badgeColor(product.badge) }}
              >
                {product.badge}
              </span>
            )}
          </div>
          {product.desc && <div className="text-[13px] text-[#5B6773] mt-2.5 mb-3.5 max-w-[520px] leading-relaxed">{product.desc}</div>}
          <div className="flex items-center gap-3 mb-4">
            {product.hotSale ? (
              <>
                <div className="text-[15px] text-[#8A96A3] line-through">{formatRs(product.price)}</div>
                <div className="font-heading font-bold text-[26px] text-[#D64545]">{formatRs(salePrice(product))}</div>
              </>
            ) : (
              <div className="font-heading font-bold text-[26px] text-primary">{formatRs(product.price)}</div>
            )}
            {product.outOfStock ? (
              <span className="text-xs font-semibold text-[#D64545] bg-[#FBE9E9] px-2.5 py-1 rounded-md">Out of stock</span>
            ) : (
              <span className="text-xs font-semibold text-[#1F7A4D] bg-[#E6F3EC] px-2.5 py-1 rounded-md">In stock</span>
            )}
          </div>
          <div className="text-[13px] text-[#5B6773] mb-5">
            Category: {product.category} · Brand: {product.brand}
          </div>
          <button className="inline-block bg-primary text-white px-[26px] py-3.5 rounded-[9px] text-sm font-semibold cursor-pointer">
            Add to Cart
          </button>
        </div>
      </div>

      {similar.length > 0 && (
        <div className="px-8 pb-8 pt-2">
          <div className="font-heading font-bold text-base text-[#1A2027] mb-3.5">Similar Products</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {similar.map((p) => (
              <ShopProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
