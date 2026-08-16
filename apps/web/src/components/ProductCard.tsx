"use client";

import Link from "next/link";
import { formatNPR } from "@cph/shared-types";
import { useCart } from "@/context/CartContext";

export interface ProductCardData {
  id: string;
  name: string;
  price: number;
  brand: string | null;
  category: string;
  images: string[];
  rating: number | null;
  badge: string | null;
  outOfStock: boolean;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const { addItem } = useCart();

  return (
    <div className="group flex flex-col overflow-hidden rounded-card border border-border bg-white transition hover:shadow-floating">
      <Link href={`/product/${product.id}`} className="relative block aspect-square bg-bg-surface">
        {product.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[12px] text-text-muted">
            Photo coming soon
          </div>
        )}
        {product.badge && (
          <span className="absolute left-2 top-2 rounded-control bg-primary px-2 py-0.5 text-[11px] font-semibold text-white">
            {product.badge}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        {product.brand && <span className="text-[11px] uppercase tracking-wide text-text-muted">{product.brand}</span>}
        <Link href={`/product/${product.id}`} className="line-clamp-2 text-[13px] font-medium text-text-dark hover:text-primary">
          {product.name}
        </Link>
        {product.rating != null && (
          <span className="text-[12px] text-text-muted">★ {product.rating.toFixed(1)}</span>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-heading text-[14px] font-bold text-text-dark">{formatNPR(product.price)}</span>
          <button
            onClick={() => addItem(product.id, 1)}
            disabled={product.outOfStock}
            className="rounded-control bg-primary px-3 py-1.5 text-[12px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-text-muted"
          >
            {product.outOfStock ? "Out of stock" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
