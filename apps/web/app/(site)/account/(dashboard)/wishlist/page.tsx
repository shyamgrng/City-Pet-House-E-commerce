"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { apiFetch } from "@/lib/api";
import { ProductCard, ProductCardData } from "@/components/ProductCard";

export default function WishlistPage() {
  const { accessToken } = useAuth();
  const { ids } = useWishlist();
  const [items, setItems] = useState<ProductCardData[] | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    apiFetch<ProductCardData[]>("/wishlist", { accessToken }).then(setItems);
  }, [accessToken]);

  if (!items) return <p className="text-[13px] text-text-muted">Loading wishlist…</p>;

  // Filtered against the shared WishlistContext so un-hearting a card here
  // (or anywhere else) removes it immediately, not just after a reload.
  const visible = items.filter((item) => ids.has(item.id));

  if (visible.length === 0) return <p className="text-[13px] text-text-muted">Your wishlist is empty.</p>;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {visible.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
