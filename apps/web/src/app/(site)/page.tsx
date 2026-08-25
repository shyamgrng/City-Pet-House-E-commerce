"use client";

import Link from "next/link";
import { Suspense } from "react";
import AvailablePuppiesRail from "@/components/AvailablePuppiesRail";
import BrandCarousel from "@/components/BrandCarousel";
import DealsRail from "@/components/DealsRail";
import HealthCareRail from "@/components/HealthCareRail";
import LatestBlogRail from "@/components/LatestBlogRail";
import MediaSlot from "@/components/MediaSlot";
import ProductRail from "@/components/ProductRail";
import SignInNoticeBanner from "@/components/SignInNoticeBanner";
import TestimonialsRail from "@/components/TestimonialsRail";
import { useBrand } from "@/context/BrandContext";
import { useHomeContent } from "@/context/HomeContentContext";
import { categories } from "@/lib/home-data";

export default function HomePage() {
  const { content, ready } = useHomeContent();
  const { brands } = useBrand();
  if (!ready) return null;
  const { heroHeadline, heroSubtext, hotSaleBannerText, microchipBannerText, deliveryBannerText, groomingBannerText } = content;

  return (
    <div className="bg-[#FDFEFE]">
      <Suspense fallback={null}>
        <SignInNoticeBanner />
      </Suspense>

      {/* Hero */}
      <div className="flex flex-col lg:flex-row gap-3.5 px-8 pt-5 pb-2">
        <div className="flex-[2.2] relative h-[300px] rounded-xl overflow-hidden">
          <MediaSlot src={content.heroImage} label="cover photo — shop & clinic" fit="cover" className="absolute inset-0 w-full h-full" />
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
              <Link href="/shop" className="bg-primary text-white px-[18px] py-2.5 rounded-lg text-xs font-semibold cursor-pointer">
                Shop Now
              </Link>
              <Link href="/vet" className="bg-white text-[#1A2027] px-[18px] py-2.5 rounded-lg text-xs font-semibold cursor-pointer">
                Book a Vet
              </Link>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-3.5">
          <div className="flex-1 relative rounded-xl overflow-hidden">
            <MediaSlot src={content.banner1Image} label="promo — hot sale, shop deals" fit="cover" className="absolute inset-0 w-full h-full" />
            {content.banner1Text && (
              <div className="absolute left-3.5 bottom-3.5 right-3.5 text-white text-[13px] font-bold" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
                {content.banner1Text}
              </div>
            )}
          </div>
          <div className="flex-1 relative rounded-xl overflow-hidden">
            <MediaSlot src={content.banner2Image} label="promo — vet consult booking" fit="cover" className="absolute inset-0 w-full h-full" />
            {content.banner2Text && (
              <div className="absolute left-3.5 bottom-3.5 right-3.5 text-white text-[13px] font-bold" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
                {content.banner2Text}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-3.5 px-8 pt-4 pb-6">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/pets?species=${encodeURIComponent(cat.name)}`}
            className="group flex-1 min-w-[110px] flex flex-col items-center gap-2 cursor-pointer transition-transform duration-200 hover:scale-105"
          >
            <MediaSlot
              src={content.categoryImages[cat.name]}
              label={cat.name}
              shape="circle"
              className="w-[115px] h-[115px] transition-shadow duration-200 group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.28)]"
            />
            <div className="text-xs font-semibold text-[#1A2027]">{cat.name}</div>
          </Link>
        ))}
      </div>

      {/* Available Puppies */}
      <div className="pt-1">
        <div className="px-8 pb-2.5 flex justify-between items-center">
          <div className="font-heading font-bold text-base text-[#1A2027]">Available Puppies</div>
          <Link href="/pets" className="text-xs text-primary font-semibold cursor-pointer">
            See all →
          </Link>
        </div>
        <AvailablePuppiesRail />

        {/* Microchip banner */}
        <div className="mx-8 mb-7 aspect-[1400/200] rounded-xl relative overflow-hidden flex flex-col items-start justify-center px-8 gap-3">
          <MediaSlot src={content.microchipBannerImage} label="banner — pet microchipping" fit="cover" className="absolute inset-0 w-full h-full" />
          <div
            className="relative text-white font-heading font-bold text-[19px]"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
          >
            {microchipBannerText}
          </div>
          <Link href="/services/dog-cat-microchipping" className="relative bg-primary text-white px-[22px] py-2.5 rounded-[9px] text-[13px] font-semibold cursor-pointer">
            Book Now
          </Link>
        </div>
      </div>

      {/* Health & Wellness Care */}
      <div className="mx-8 px-5 pt-5 pb-6 rounded-xl bg-[#E7EFEC]">
        <div className="flex justify-center items-center mb-[26px] relative">
          <div className="font-heading font-bold text-lg text-[#1A2027]">City Pet Health &amp; Wellness Care</div>
          <Link href="/services" className="text-xs text-[#1F7A4D] font-semibold cursor-pointer absolute right-0">
            See all →
          </Link>
        </div>
        <HealthCareRail />
      </div>

      {/* Hot Sales Banner */}
      <div className="mx-8 mt-[22px] mb-3.5 aspect-[1400/200] rounded-xl overflow-hidden relative flex items-center px-8">
        <MediaSlot src={content.hotSaleBannerImage} label="banner" fit="cover" className="absolute inset-0 w-full h-full" />
        {hotSaleBannerText && (
          <div className="relative text-white font-heading font-bold text-lg" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            {hotSaleBannerText}
          </div>
        )}
      </div>

      {/* Today's Deals */}
      <DealsRail />

      {/* Pet Food / Pet Accessories / Fashion Wear */}
      <div className="pt-1">
        <ProductRail title="Pet Food" category="Pet Food" />
        <ProductRail title="Pet Accessories" category="Pet Accessories" />
        <ProductRail title="Fashion Wear" category="Fashion Wear" />
      </div>

      {/* Toys for Your Pet */}
      <ProductRail title="Toys for Your Pet" category="Pet Toys" />

      {/* Delivery banner */}
      <div className="mx-8 mb-8 aspect-[1400/200] rounded-xl overflow-hidden relative flex items-center justify-center">
        <MediaSlot src={content.deliveryBannerImage} label="delivery banner" fit="cover" className="absolute inset-0 w-full h-full" />
        {deliveryBannerText && (
          <div className="relative text-primary text-sm font-semibold bg-white/85 px-[18px] py-2 rounded-lg">
            {deliveryBannerText}
          </div>
        )}
      </div>

      {/* Shop by Brand + Grooming Accessories (light blue section) */}
      <div className="pt-1">
        <div className="px-8 pb-2.5">
          <div className="font-heading font-bold text-base text-[#1A2027]">Shop by Brand</div>
        </div>
        <BrandCarousel brands={brands} images={content.brandImages} />
        <ProductRail title="Grooming Accessories" category="Grooming Supplies" padBottom="pb-9" />
      </div>

      {/* Big grooming banner */}
      <div className="mx-8 mt-8 mb-8 h-[420px] rounded-xl overflow-hidden relative flex items-center justify-between px-8">
        <MediaSlot src={content.groomingBannerImage} label="big banner — dog grooming services" fit="cover" className="absolute inset-0 w-full h-full" />
        <div
          className="relative text-white font-heading font-bold text-xl"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
        >
          {groomingBannerText}
        </div>
        <Link href="/services/pet-grooming" className="relative bg-[#1F7A4D] text-white px-6 py-3 rounded-[9px] text-[13px] font-semibold cursor-pointer shrink-0">
          Book Now
        </Link>
      </div>

      {/* Testimonials + Blog (cream section) */}
      <div className="pt-1">
        <div className="px-8 pb-2.5">
          <div className="font-heading font-bold text-base text-[#1A2027]">Our Happy Customers</div>
        </div>
        <TestimonialsRail />

        <div className="px-8 pb-2.5">
          <div className="font-heading font-bold text-base text-[#1A2027]">Latest from the Blog</div>
        </div>
        <LatestBlogRail />
      </div>
    </div>
  );
}
