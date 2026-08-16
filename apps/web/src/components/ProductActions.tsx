"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { apiFetch } from "@/lib/api";

export function ProductActions({ productId, outOfStock }: { productId: string; outOfStock: boolean }) {
  const { user, accessToken } = useAuth();
  const { addItem } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);

  async function handleWishlist() {
    if (!user) {
      router.push(`/account/signin?next=${encodeURIComponent(pathname)}`);
      return;
    }
    await apiFetch(`/wishlist/${productId}`, { method: "POST", accessToken });
    setWishlisted(true);
  }

  async function handleAddToCart() {
    setAdding(true);
    try {
      await addItem(productId, qty);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <label className="text-[13px] text-text-secondary">Qty</label>
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
          className="w-16 rounded-control border border-border px-2 py-1.5 text-[13px]"
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={outOfStock || adding}
          className="flex-1 rounded-control bg-primary px-5 py-2.5 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-text-muted"
        >
          {outOfStock ? "Out of stock" : adding ? "Adding…" : "Add to Cart"}
        </button>
        <button
          onClick={handleWishlist}
          className={`rounded-control border px-4 py-2.5 text-[13px] font-semibold ${
            wishlisted ? "border-error text-error" : "border-border text-text-secondary hover:border-primary hover:text-primary"
          }`}
        >
          {wishlisted ? "♥ Wishlisted" : "♡ Wishlist"}
        </button>
      </div>
    </div>
  );
}
