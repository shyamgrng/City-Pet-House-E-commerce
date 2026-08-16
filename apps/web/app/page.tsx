import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Rail } from "@/components/Rail";
import { ProductCard, ProductCardData } from "@/components/ProductCard";

const CATEGORIES = [
  { label: "Dog", species: "Dog" },
  { label: "Cat", species: "Cat" },
  { label: "Small Pets", species: "Small Pets" },
  { label: "Birds", species: "Birds" },
  { label: "Fish", species: "Fish" },
];

async function getDeals() {
  return apiFetch<ProductCardData[]>("/products/deals/today").catch(() => []);
}

async function getPetFood() {
  return apiFetch<ProductCardData[]>("/products?category=Pet Food").catch(() => []);
}

async function getFashionWear() {
  return apiFetch<ProductCardData[]>("/products?category=Fashion Wear").catch(() => []);
}

export default async function HomePage() {
  const [deals, petFood, fashionWear] = await Promise.all([getDeals(), getPetFood(), getFashionWear()]);

  return (
    <div>
      <section className="bg-gradient-to-br from-primary to-[#0f6d94] px-6 py-14 text-white">
        <div className="mx-auto max-w-7xl">
          <h1 className="max-w-xl text-[28px] leading-tight">Pet products, puppies, adoption &amp; vet care</h1>
          <p className="mt-3 max-w-lg text-[14px] text-white/90">
            Order online, pay by receipt upload — shop, puppies, adoption or vet consults.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-block rounded-control bg-white px-5 py-2.5 text-[13px] font-semibold text-primary hover:opacity-90"
          >
            Shop now
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-5 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.species}
              href={`/pets?species=${encodeURIComponent(cat.species)}`}
              className="flex flex-col items-center gap-2 rounded-card border border-border bg-white py-5 text-[13px] font-medium text-text-dark hover:border-primary hover:text-primary"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </section>

      {deals.length > 0 && (
        <Rail title="Today's Deals" viewAllHref="/shop">
          {deals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </Rail>
      )}

      {petFood.length > 0 && (
        <Rail title="Pet Food" viewAllHref="/shop?category=Pet Food">
          {petFood.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </Rail>
      )}

      {fashionWear.length > 0 && (
        <Rail title="Fashion Wear" viewAllHref="/shop?category=Fashion Wear">
          {fashionWear.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </Rail>
      )}
    </div>
  );
}
