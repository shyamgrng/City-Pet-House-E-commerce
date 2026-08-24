"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MediaSlot from "@/components/MediaSlot";
import ShopProductCard from "@/components/ShopProductCard";
import { useCart } from "@/context/CartContext";
import { useCatalog } from "@/context/CatalogContext";
import { formatRs, salePrice } from "@/lib/catalog-types";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { products } = useCatalog();
  const { addItem } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="px-8 py-10 text-center text-sm text-[#8A96A3]">
        Product not found. <Link href="/shop" className="text-primary font-semibold">Back to Shop</Link>
      </div>
    );
  }

  const similar = products
    .filter((p) => p.category === product.category && p.id !== product.id && p.status === "active")
    .slice(0, 5);

  return (
    <div>
      <div className="flex gap-8 px-8 py-7">
        <div className="flex-1">
          <div className="h-[380px] rounded-2xl relative overflow-hidden mb-2.5">
            <MediaSlot
              src={product.photos[activePhoto] || product.photo}
              label={product.photoAlts[activePhoto] || product.name}
              className="absolute inset-0 w-full h-full"
            />
          </div>
          {product.photos.length > 1 && (
            <div className="flex gap-2">
              {product.photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  className="w-16 h-16 rounded-lg overflow-hidden relative cursor-pointer shrink-0"
                  style={{ outline: activePhoto === i ? "2px solid #1996C8" : "1px solid #E4E9EC", outlineOffset: "-1px" }}
                >
                  <MediaSlot src={photo} label={product.photoAlts[i] || `photo ${i + 1}`} className="absolute inset-0 w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-heading font-bold text-2xl text-[#1A2027]">{product.name}</div>
          <div className="flex gap-2 mt-2">
            {product.newArrival && (
              <span className="text-[10px] font-bold text-white px-2.5 py-1 rounded-full inline-block bg-primary">New</span>
            )}
          </div>
          {product.desc && <div className="text-[13px] text-[#5B6773] mt-2.5 mb-3.5 max-w-[520px] leading-relaxed">{product.desc}</div>}
          {(product.sizes.length > 0 || product.colours.length > 0) && (
            <div className="flex flex-wrap gap-4 mb-3.5">
              {product.sizes.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-[#8A96A3] mb-1">Size</div>
                  <div className="flex gap-1.5">
                    {product.sizes.map((sz) => (
                      <span key={sz} className="text-xs font-semibold text-[#3A4652] border border-[#E4E9EC] rounded-md px-2 py-1">
                        {sz}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {product.colours.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-[#8A96A3] mb-1">Colour</div>
                  <div className="flex gap-1.5">
                    {product.colours.map((c) => (
                      <span key={c} className="text-xs font-semibold text-[#3A4652] border border-[#E4E9EC] rounded-md px-2 py-1">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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

          {!product.outOfStock && (
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-lg border border-[#E4E9EC] text-[#3A4652] font-bold cursor-pointer"
              >
                −
              </button>
              <div className="w-10 text-center text-sm font-semibold text-[#1A2027]">{qty}</div>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-9 h-9 rounded-lg border border-[#E4E9EC] text-[#3A4652] font-bold cursor-pointer"
              >
                +
              </button>
            </div>
          )}

          <div className="flex gap-3 items-center">
            <button
              onClick={() => {
                if (product.outOfStock) return;
                addItem({ id: product.id, name: product.name, price: product.price }, qty);
                setAdded(true);
                setTimeout(() => setAdded(false), 2000);
              }}
              disabled={product.outOfStock}
              className="inline-block bg-primary text-white px-[26px] py-3.5 rounded-[9px] text-sm font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {product.outOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
            {!product.outOfStock && (
              <button
                onClick={() => {
                  addItem({ id: product.id, name: product.name, price: product.price }, qty);
                  router.push("/cart");
                }}
                className="inline-block bg-[#F0F2F4] text-[#1A2027] px-[22px] py-3.5 rounded-[9px] text-sm font-semibold cursor-pointer"
              >
                Buy Now
              </button>
            )}
            {added && <span className="text-xs font-semibold text-[#1F7A4D]">✓ Added to cart</span>}
          </div>
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
