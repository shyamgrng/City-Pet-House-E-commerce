import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Rail } from "@/components/Rail";
import { ProductCard, ProductCardData } from "@/components/ProductCard";
import { PromoBanner } from "@/components/PromoBanner";
import { TestimonialCard, TestimonialData } from "@/components/TestimonialCard";
import { BlogPostCard, BlogPostData } from "@/components/BlogPostCard";

const CATEGORIES = [
  { label: "Dog", species: "Dog" },
  { label: "Cat", species: "Cat" },
  { label: "Small Pets", species: "Small Pets" },
  { label: "Birds", species: "Birds" },
  { label: "Fish", species: "Fish" },
];

interface Brand {
  id: string;
  name: string;
  logo: string | null;
}

async function getDeals() {
  return apiFetch<ProductCardData[]>("/products/deals/today").catch(() => []);
}

async function getByCategory(category: string) {
  return apiFetch<ProductCardData[]>(`/products?category=${encodeURIComponent(category)}`).catch(() => []);
}

async function getBrands() {
  return apiFetch<Brand[]>("/brands").catch(() => []);
}

async function getTestimonials() {
  return apiFetch<TestimonialData[]>("/testimonials").catch(() => []);
}

async function getLatestBlogPosts() {
  return apiFetch<BlogPostData[]>("/blog-posts?limit=3").catch(() => []);
}

export default async function HomePage() {
  const [deals, petFood, fashionWear, groomingAccessories, brands, testimonials, blogPosts] = await Promise.all([
    getDeals(),
    getByCategory("Pet Food"),
    getByCategory("Fashion Wear"),
    getByCategory("Grooming Supplies"),
    getBrands(),
    getTestimonials(),
    getLatestBlogPosts(),
  ]);

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

      {groomingAccessories.length > 0 && (
        <Rail title="Grooming Accessories" viewAllHref="/shop?category=Grooming Supplies">
          {groomingAccessories.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </Rail>
      )}

      <PromoBanner
        title="Professional Grooming for a Happier, Healthier Pet"
        ctaLabel="Book Now"
        ctaHref="tel:+9779851313717"
        height="220px"
        accent="success"
      />

      {brands.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-8">
          <h2 className="mb-4 text-[20px]">Shop by Brand</h2>
          <div className="grid grid-cols-4 gap-4 sm:grid-cols-8">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/shop?brand=${encodeURIComponent(brand.name)}`}
                className="flex flex-col items-center gap-2"
              >
                <span className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-bg-surface text-[11px] text-text-muted">
                  {brand.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-8">
          <h2 className="mb-4 text-[20px]">Our Happy Customers</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </section>
      )}

      {blogPosts.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-8">
          <h2 className="mb-4 text-[20px]">Latest from the Blog</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {blogPosts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
