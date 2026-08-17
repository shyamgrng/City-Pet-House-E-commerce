import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { ProductCard, ProductCardData } from "@/components/ProductCard";
import { ShopSearchBar } from "@/components/ShopSearchBar";

const CATEGORIES = ["Pet Food", "Pet Accessories", "Fashion Wear", "Pet Toys", "Pet Supplement", "Grooming Supplies"];
const RATING_OPTIONS = [5, 4, 3, 2];
const PRICE_OPTIONS: { label: string; min: number; max: number }[] = [
  { label: "Under Rs. 500", min: 0, max: 500 },
  { label: "Rs. 500 – 1,500", min: 500, max: 1500 },
  { label: "Rs. 1,500 – 5,000", min: 1500, max: 5000 },
  { label: "Rs. 5,000+", min: 5000, max: Infinity },
];

interface Brand {
  id: string;
  name: string;
  logo: string | null;
}

interface ShopSearchParams {
  category?: string;
  brand?: string;
  minRating?: string;
  price?: string;
  search?: string;
  aiQuery?: string;
  aiIds?: string;
}

function priceKey(min: number, max: number) {
  return `${min}-${max === Infinity ? "inf" : max}`;
}

function hrefFor(current: ShopSearchParams, overrides: Partial<Record<keyof ShopSearchParams, string | null>>) {
  const merged: Record<string, string> = {};
  Object.entries(current).forEach(([k, v]) => {
    if (v) merged[k] = v;
  });
  Object.entries(overrides).forEach(([k, v]) => {
    if (v) merged[k] = v;
    else delete merged[k];
  });
  const qs = new URLSearchParams(merged);
  const s = qs.toString();
  return `/shop${s ? `?${s}` : ""}`;
}

function getBrands() {
  return apiFetch<Brand[]>("/brands").catch(() => []);
}

async function getProducts(params: ShopSearchParams) {
  if (params.aiIds) {
    const ids = params.aiIds.split(",").filter(Boolean);
    if (!ids.length) return [];
    return apiFetch<ProductCardData[]>(`/products?ids=${ids.join(",")}`).catch(() => []);
  }

  const qs = new URLSearchParams();
  if (params.category) qs.set("category", params.category);
  if (params.brand) qs.set("brand", params.brand);
  if (params.minRating) qs.set("minRating", params.minRating);
  if (params.search) qs.set("search", params.search);
  if (params.price) {
    const [min, max] = params.price.split("-");
    if (min) qs.set("minPrice", min);
    if (max && max !== "inf") qs.set("maxPrice", max);
  }
  const s = qs.toString();
  return apiFetch<ProductCardData[]>(`/products${s ? `?${s}` : ""}`).catch(() => []);
}

export default async function ShopPage({ searchParams }: { searchParams: ShopSearchParams }) {
  const [brands, products] = await Promise.all([getBrands(), getProducts(searchParams)]);

  const isBrandFiltered = !!searchParams.brand;
  const isCategoryFiltered = !!searchParams.category;
  const activeRating = searchParams.minRating ? Number(searchParams.minRating) : 0;

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
      <aside className="w-[200px] shrink-0">
        <div className="mb-3 font-heading text-[14px] font-bold text-text-dark">Categories</div>
        {CATEGORIES.map((cat) => {
          const active = searchParams.category === cat;
          return (
            <Link
              key={cat}
              href={hrefFor(searchParams, { category: cat, brand: null, aiQuery: null, aiIds: null })}
              className={`block border-b border-border py-2 text-[13px] ${
                active ? "font-bold text-primary" : "text-text-secondary"
              }`}
            >
              {cat}
            </Link>
          );
        })}

        <div className="mb-3 mt-5 font-heading text-[14px] font-bold text-text-dark">Brand</div>
        {brands.map((b) => {
          const active = searchParams.brand === b.name;
          return (
            <Link
              key={b.id}
              href={hrefFor(searchParams, { brand: b.name, aiQuery: null, aiIds: null })}
              className={`block border-b border-border py-2 text-[13px] ${
                active ? "font-bold text-primary" : "text-text-secondary"
              }`}
            >
              {b.name}
            </Link>
          );
        })}

        <div className="mb-3 mt-5 font-heading text-[14px] font-bold text-text-dark">Rating</div>
        {RATING_OPTIONS.map((n) => {
          const active = activeRating === n;
          return (
            <Link
              key={n}
              href={hrefFor(searchParams, { minRating: active ? null : String(n), aiQuery: null, aiIds: null })}
              className={`block border-b border-border py-2 text-[13px] ${
                active ? "font-bold text-primary" : "text-text-secondary"
              }`}
            >
              {"★".repeat(n) + "☆".repeat(5 - n)} {n} & up
            </Link>
          );
        })}

        <div className="mb-3 mt-5 font-heading text-[14px] font-bold text-text-dark">Price</div>
        {PRICE_OPTIONS.map(({ label, min, max }) => {
          const key = priceKey(min, max);
          const active = searchParams.price === key;
          return (
            <Link
              key={key}
              href={hrefFor(searchParams, { price: active ? null : key, aiQuery: null, aiIds: null })}
              className={`block border-b border-border py-2 text-[13px] ${
                active ? "font-bold text-primary" : "text-text-secondary"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </aside>

      <div className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-[20px]">Shop</h1>
        </div>

        <ShopSearchBar />

        {searchParams.aiQuery && (
          <p className="mb-4 flex items-center gap-2 text-[12px] text-ai-accent">
            ✨ Showing AI results for &ldquo;{searchParams.aiQuery}&rdquo;
            <Link href={hrefFor(searchParams, { aiQuery: null, aiIds: null })} className="font-semibold text-error">
              Clear ✕
            </Link>
          </p>
        )}

        {(isBrandFiltered || isCategoryFiltered) && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {isBrandFiltered && (
              <>
                <span className="text-[12px] text-text-secondary">Filtered by brand:</span>
                <span className="rounded-full bg-[#EAF4F9] px-3 py-1 text-[12px] font-semibold text-primary">
                  {searchParams.brand}
                </span>
                <Link href={hrefFor(searchParams, { brand: null })} className="text-[12px] text-error">
                  Clear ✕
                </Link>
              </>
            )}
            {isCategoryFiltered && (
              <>
                {isBrandFiltered && <span className="mx-1 h-4 w-px bg-border" />}
                <span className="text-[12px] text-text-secondary">Filtered by category:</span>
                <span className="rounded-full bg-[#EAF4F9] px-3 py-1 text-[12px] font-semibold text-primary">
                  {searchParams.category}
                </span>
                <Link href={hrefFor(searchParams, { category: null })} className="text-[12px] text-error">
                  Clear ✕
                </Link>
              </>
            )}
          </div>
        )}

        {products.length === 0 ? (
          <p className="py-16 text-center text-[14px] text-text-muted">No products match these filters.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
