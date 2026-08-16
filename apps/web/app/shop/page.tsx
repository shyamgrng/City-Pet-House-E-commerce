import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { ProductCard, ProductCardData } from "@/components/ProductCard";

const CATEGORIES = ["All", "Pet Accessories", "Fashion Wear", "Pet Toys", "Pet Supplement", "Grooming Supplies", "Pet Food"];

interface ShopSearchParams {
  category?: string;
  brand?: string;
  search?: string;
  minRating?: string;
}

function buildQuery(params: ShopSearchParams) {
  const qs = new URLSearchParams();
  if (params.category && params.category !== "All") qs.set("category", params.category);
  if (params.brand) qs.set("brand", params.brand);
  if (params.search) qs.set("search", params.search);
  if (params.minRating) qs.set("minRating", params.minRating);
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export default async function ShopPage({ searchParams }: { searchParams: ShopSearchParams }) {
  const products = await apiFetch<ProductCardData[]>(`/products${buildQuery(searchParams)}`).catch(() => []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="mb-6 text-[22px]">Shop</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const active = (searchParams.category ?? "All") === cat;
          return (
            <Link
              key={cat}
              href={`/shop${buildQuery({ ...searchParams, category: cat })}`}
              className={`rounded-full px-4 py-1.5 text-[12px] font-medium ${
                active ? "bg-primary text-white" : "border border-border bg-white text-text-secondary hover:border-primary"
              }`}
            >
              {cat}
            </Link>
          );
        })}
      </div>

      {searchParams.search && (
        <p className="mb-4 text-[13px] text-text-secondary">
          Showing results for <span className="font-semibold text-text-dark">&ldquo;{searchParams.search}&rdquo;</span>
        </p>
      )}

      {products.length === 0 ? (
        <p className="py-16 text-center text-[14px] text-text-muted">No products match these filters.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
