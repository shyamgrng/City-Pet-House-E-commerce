import Link from "next/link";
import AvailablePuppiesRail from "@/components/AvailablePuppiesRail";
import HealthCareRail from "@/components/HealthCareRail";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import LatestBlogRail from "@/components/LatestBlogRail";
import ProductRail from "@/components/ProductRail";
import {
  brands,
  categories,
  fashionWear,
  groomingAccessories,
  petAccessories,
  petFood,
  petToys,
  testimonials,
  todaysDeals,
} from "@/lib/home-data";

const heroHeadline = "Pet products, puppies, adoption & vet care";
const heroSubtext = "Order online, pay by receipt upload — shop, puppies, adoption or vet consults.";
const microchipBannerText = "Dog & Cat Microchipping — quick, permanent ID for your pet.";
const groomingBannerText = "Professional dog grooming — book your slot today";
const deliveryBannerText = "Delivery available across Kathmandu Valley — Kathmandu · Lalitpur · Bhaktapur";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <div className="flex flex-col lg:flex-row gap-3.5 px-8 pt-5 pb-2">
        <div className="flex-[2.2] relative h-[300px] rounded-xl overflow-hidden">
          <ImagePlaceholder label="cover photo — shop & clinic" className="absolute inset-0 w-full h-full" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, rgba(26,32,39,0.55) 0%, rgba(26,32,39,0.15) 55%, rgba(26,32,39,0) 100%)",
            }}
          />
          <div className="relative px-7 max-w-[460px] h-full flex flex-col justify-center pointer-events-none">
            <div
              className="font-heading font-bold text-[26px] text-white leading-tight"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.45)" }}
            >
              {heroHeadline}
            </div>
            <div className="text-[13px] text-[#EDF2F5] mt-2.5 mb-[18px] max-w-[400px]">{heroSubtext}</div>
            <div className="flex gap-2.5 pointer-events-auto">
              <button className="bg-primary text-white px-[18px] py-2.5 rounded-lg text-xs font-semibold cursor-pointer">
                Shop Now
              </button>
              <button className="bg-white text-[#1A2027] px-[18px] py-2.5 rounded-lg text-xs font-semibold cursor-pointer">
                Book a Vet
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-3.5">
          <div className="flex-1 relative rounded-xl overflow-hidden">
            <ImagePlaceholder label="promo — hot sale, shop deals" className="absolute inset-0 w-full h-full" />
          </div>
          <div className="flex-1 relative rounded-xl overflow-hidden">
            <ImagePlaceholder label="promo — vet consult booking" className="absolute inset-0 w-full h-full" />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-3.5 px-8 pt-4 pb-6">
        {categories.map((cat) => (
          <div key={cat.slug} className="flex-1 min-w-[110px] flex flex-col items-center gap-2 cursor-pointer">
            <ImagePlaceholder label={cat.name} shape="circle" className="w-[115px] h-[115px]" />
            <div className="text-xs font-semibold text-[#1A2027]">{cat.name}</div>
          </div>
        ))}
      </div>

      {/* Available Puppies */}
      <div className="bg-[#F3F9FC] pt-1">
        <div className="px-8 pb-2.5 flex justify-between items-center">
          <div className="font-heading font-bold text-base text-[#1A2027]">Available Puppies</div>
          <Link href="/pets" className="text-xs text-primary font-semibold cursor-pointer">
            See all →
          </Link>
        </div>
        <AvailablePuppiesRail />

        {/* Microchip banner */}
        <div className="mx-8 mb-7 h-[140px] rounded-xl relative overflow-hidden flex flex-col items-start justify-center px-8 gap-3">
          <ImagePlaceholder label="banner — pet microchipping" className="absolute inset-0 w-full h-full" />
          <div
            className="relative text-white font-heading font-bold text-[19px]"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
          >
            {microchipBannerText}
          </div>
          <button className="relative bg-primary text-white px-[22px] py-2.5 rounded-[9px] text-[13px] font-semibold cursor-pointer">
            Book Now
          </button>
        </div>
      </div>

      {/* Health & Wellness Care */}
      <div className="px-5 pt-5 pb-6 bg-[#E7EFEC]">
        <div className="flex justify-center items-center mb-[26px] relative">
          <div className="font-heading font-bold text-lg text-[#1A2027]">City Pet Health &amp; Wellness Care</div>
          <Link href="/services" className="text-xs text-[#1F7A4D] font-semibold cursor-pointer absolute right-0">
            See all →
          </Link>
        </div>
        <HealthCareRail />
      </div>

      {/* Hot Sales Banner */}
      <div className="mx-8 mt-[22px] mb-3.5 h-[110px] rounded-xl overflow-hidden relative">
        <ImagePlaceholder label="banner" className="absolute inset-0 w-full h-full" />
      </div>

      {/* Today's Deals */}
      <div className="px-8 pb-2.5 flex justify-between items-center">
        <div className="font-heading font-bold text-base text-[#1A2027]">Today&apos;s Deals</div>
        <div className="text-xs text-primary font-semibold cursor-pointer">See all →</div>
      </div>
      {todaysDeals.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 px-8 pb-8">
          {todaysDeals.map((p) => (
            <div key={p.name} className="border border-[#E4E9EC] rounded-[10px] overflow-hidden cursor-pointer">
              <div className="h-[100px] relative">
                <ImagePlaceholder label="product photo" className="absolute inset-0 w-full h-full" />
                <div className="absolute top-1.5 right-1.5 bg-[#D64545] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  Hot Sale
                </div>
              </div>
              <div className="p-2.5">
                <div className="text-[13px] text-[#1A2027] font-medium">{p.name}</div>
                <div className="flex justify-between items-center mt-1">
                  <div>
                    <div className="text-[9px] text-[#8A96A3] line-through">{p.originalPrice}</div>
                    <div className="text-sm font-bold text-[#D64545]">{p.salePrice}</div>
                  </div>
                  <div className="text-sm cursor-pointer text-[#C7CDD2]">♥</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mx-8 mb-8 p-[22px] border border-dashed border-[#E4E9EC] rounded-[10px] text-center text-xs text-[#8A96A3]">
          No deals running right now — tick &quot;Today&apos;s Deal&quot; on a product in Admin → Shop to feature it here.
        </div>
      )}

      {/* Pet Food / Pet Accessories / Fashion Wear (cream section) */}
      <div className="bg-[#F7F4EF] pt-1">
        <ProductRail title="Pet Food" products={petFood} />
        <ProductRail title="Pet Accessories" products={petAccessories} />
        <ProductRail title="Fashion Wear" products={fashionWear} />
      </div>

      {/* Toys for Your Pet */}
      <ProductRail title="Toys for Your Pet" products={petToys} />

      {/* Delivery banner */}
      <div className="mx-8 mb-8 h-[100px] rounded-xl overflow-hidden relative flex items-center justify-center">
        <ImagePlaceholder label="delivery banner" className="absolute inset-0 w-full h-full" />
        <div className="relative flex items-center gap-2.5 text-primary text-sm font-semibold bg-white/85 px-[18px] py-2 rounded-lg">
          🚚 {deliveryBannerText}
        </div>
      </div>

      {/* Shop by Brand + Grooming Accessories (light blue section) */}
      <div className="bg-[#F3F9FC] pt-1">
        <div className="px-8 pb-2.5">
          <div className="font-heading font-bold text-base text-[#1A2027]">Shop by Brand</div>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 px-8 pb-7">
          {brands.map((b) => (
            <div key={b} className="flex flex-col items-center gap-2 cursor-pointer">
              <ImagePlaceholder label={b} shape="circle" className="w-[88px] h-[88px]" />
              <div className="text-[11px] font-semibold text-[#1A2027]">{b}</div>
            </div>
          ))}
        </div>
        <ProductRail title="Grooming Accessories" products={groomingAccessories} padBottom="pb-9" />
      </div>

      {/* Big grooming banner */}
      <div className="mx-8 mb-8 h-[420px] rounded-xl overflow-hidden relative flex items-center justify-between px-8">
        <ImagePlaceholder label="big banner — dog grooming services" className="absolute inset-0 w-full h-full" />
        <div
          className="relative text-white font-heading font-bold text-xl"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
        >
          {groomingBannerText}
        </div>
        <button className="relative bg-[#1F7A4D] text-white px-6 py-3 rounded-[9px] text-[13px] font-semibold cursor-pointer shrink-0">
          Book Now
        </button>
      </div>

      {/* Testimonials + Blog (cream section) */}
      <div className="bg-[#F7F4EF] pt-1">
        <div className="px-8 pb-2.5">
          <div className="font-heading font-bold text-base text-[#1A2027]">Our Happy Customers</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 px-8 pb-7">
          {testimonials.map((t) => (
            <div key={t.name} className="border border-[#E4E9EC] rounded-[10px] p-4">
              <div className="text-xs text-[#3A4652] leading-relaxed mb-2.5">&quot;{t.quote}&quot;</div>
              <div className="text-xs font-semibold text-[#1A2027]">{t.name}</div>
            </div>
          ))}
        </div>

        <div className="px-8 pb-2.5">
          <div className="font-heading font-bold text-base text-[#1A2027]">Latest from the Blog</div>
        </div>
        <LatestBlogRail />
      </div>
    </div>
  );
}
