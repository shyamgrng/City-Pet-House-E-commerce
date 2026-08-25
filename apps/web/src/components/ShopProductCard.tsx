"use client";

import Link from "next/link";
import MediaSlot from "./MediaSlot";
import { useWishlist } from "@/context/WishlistContext";
import { formatRs, salePrice, type Product } from "@/lib/catalog-types";

export default function ShopProductCard({ product }: { product: Product }) {
  const { has, toggle } = useWishlist();
  const saved = has(product.id, "product");

  return (
    <Link href={`/product/${product.id}`} className="block rounded-[10px] overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-lg">
      <div className="h-[110px] relative">
        <MediaSlot src={product.photo} label={product.photoAlts[0] || product.name} className="absolute inset-0 w-full h-full" />
        {product.newArrival && (
          <div className="absolute top-1.5 left-1.5 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded bg-primary">New</div>
        )}
        {product.hotSale && (
          <div className="absolute top-1.5 right-1.5 bg-[#D64545] text-white text-[9px] font-bold px-[7px] py-0.5 rounded">
            Hot Sale
          </div>
        )}
        {product.outOfStock && (
          <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-black/70 text-white text-[9px] font-semibold px-1.5 py-1 rounded text-center">
            Out of stock
          </div>
        )}
      </div>
      <div className="p-2.5">
        <div className="text-xs text-[#1A2027] font-medium">{product.name}</div>
        {product.rating > 0 && (
          <div className="text-[10px] text-[#C9962B] mt-0.5">
            {"★".repeat(Math.round(product.rating))}
            {"☆".repeat(5 - Math.round(product.rating))} <span className="text-[#8A96A3]">{product.rating}</span>
          </div>
        )}
        <div className="flex justify-between items-center mt-1">
          {product.hotSale ? (
            <div>
              <div className="text-[9px] text-[#8A96A3] line-through">{formatRs(product.price)}</div>
              <div className="text-sm font-bold text-[#D64545]">{formatRs(salePrice(product))}</div>
            </div>
          ) : (
            <div className="text-sm font-bold text-primary">{formatRs(product.price)}</div>
          )}
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle({ id: product.id, kind: "product", name: product.name, priceLabel: formatRs(product.price), href: `/product/${product.id}` });
            }}
            className="text-sm cursor-pointer"
            style={{ color: saved ? "#D64545" : "#C7CDD2" }}
          >
            {saved ? "♥" : "♡"}
          </div>
        </div>
      </div>
    </Link>
  );
}
