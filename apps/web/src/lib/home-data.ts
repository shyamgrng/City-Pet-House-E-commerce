export const categories = [
  { name: "Dog", bg: "#1996C8", slug: "dog" },
  { name: "Cat", bg: "#1F7A4D", slug: "cat" },
  { name: "Small Pets", bg: "#D64545", slug: "small-pets" },
  { name: "Birds", bg: "#C88A19", slug: "birds" },
  { name: "Fish", bg: "#5B6773", slug: "fish" },
];

// Available Puppies now reads live from PetContext (src/context/PetContext.tsx) via
// src/components/AvailablePuppiesRail.tsx, shared with the public /pets page and
// Admin → Pet Available.

// Health & Wellness Care rail now reads live from ServiceContext (src/context/ServiceContext.tsx)
// via src/components/HealthCareRail.tsx, linking into the public /services detail pages.

// Shop by Brand list now reads live from BrandContext (src/context/BrandContext.tsx), editable
// at Admin → Shop → Brand Setting — see src/app/(site)/page.tsx and
// src/app/admin/(dashboard)/pages/home/page.tsx.

// Product rails (Today's Deals, Pet Food, Pet Accessories, Fashion Wear, Toys, Grooming
// Accessories) now read live from CatalogContext (src/context/CatalogContext.tsx) via
// src/components/DealsRail.tsx and src/components/ProductRail.tsx.

// Testimonials now read live from TestimonialContext (src/context/TestimonialContext.tsx)
// via src/components/TestimonialsRail.tsx, editable at Admin → Pages → Testimonials.

// "Latest from the Blog" rail now reads live from BlogContext (src/context/BlogContext.tsx)
// via src/components/LatestBlogRail.tsx, linking into the public /blog detail pages.

// Footer "Our Services" links now read live from ServiceContext (src/context/ServiceContext.tsx)
// via src/components/SiteFooter.tsx, linking into the public /services detail pages.

export const footerGeneralLinks = [
  { label: "About Us", href: "/about" },
  { label: "Career", href: "/career" },
  { label: "Pet Tag Archive", href: "/pet-tag-archive" },
  { label: "Microchipping Archive", href: "/microchipping-archive" },
  { label: "Dog Breed Archive", href: "/dog-breed-archive" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Merchant Login", href: "/portal" },
];

export const footerCustomerCareLinks = [
  { label: "FAQ", href: "/faq" },
  { label: "How to Buy", href: "/how-to-buy" },
  { label: "Return & Refund", href: "/refund" },
  { label: "Contact Us", href: "/contact" },
];

export const footerQuickLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Pets Available", href: "/pets" },
  { label: "Adoption", href: "/adoption" },
  { label: "Web Vet", href: "/vet" },
];
