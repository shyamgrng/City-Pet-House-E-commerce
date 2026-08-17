"use client";

import { useState } from "react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

export function ProductActions({ productId, outOfStock }: { productId: string; outOfStock: boolean }) {
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const wishlisted = isWishlisted(productId);

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
          onClick={() => toggle(productId)}
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
