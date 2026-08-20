export type HomeProduct = {
  name: string;
  price: string;
  badge?: string;
  badgeColor?: string;
};

export type DealProduct = {
  name: string;
  originalPrice: string;
  salePrice: string;
};

export const todaysDeals: DealProduct[] = [
  { name: "Adjustable Dog Collar", originalPrice: "Rs. 450", salePrice: "Rs. 405" },
  { name: "Retractable Leash 5m", originalPrice: "Rs. 890", salePrice: "Rs. 668" },
  { name: "Dog Knit Sweater", originalPrice: "Rs. 950", salePrice: "Rs. 760" },
  { name: "Pet Raincoat", originalPrice: "Rs. 1,150", salePrice: "Rs. 978" },
  { name: "Rope Tug Toy", originalPrice: "Rs. 350", salePrice: "Rs. 298" },
  { name: "Interactive Ball Feeder", originalPrice: "Rs. 720", salePrice: "Rs. 576" },
];

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

export const petFood: HomeProduct[] = [
  { name: "Focus Puppy Food 1.2kg", price: "Rs. 1,300", badge: "New", badgeColor: "#1996C8" },
  { name: "Bairo Adult Dog Food 3kg", price: "Rs. 1,200" },
  { name: "Whiskas Adult Cat Food 1.2kg", price: "Rs. 980" },
  { name: "Focus Starter 1.2kg", price: "Rs. 1,200" },
  { name: "Rabbit Pellet Food 1kg", price: "Rs. 650" },
  { name: "Fish Flake Food 200g", price: "Rs. 380", badge: "Sale", badgeColor: "#D64545" },
];

export const petAccessories: HomeProduct[] = [
  { name: "Clumping Bentonite Cat Litter 10L", price: "Rs. 1,470" },
  { name: "Adjustable Dog Collar", price: "Rs. 450", badge: "New", badgeColor: "#1996C8" },
  { name: "Retractable Leash 5m", price: "Rs. 890" },
  { name: "Travel Carrier Bag", price: "Rs. 2,300" },
  { name: "Stainless Steel Feeding Bowl", price: "Rs. 380", badge: "Sale", badgeColor: "#D64545" },
  { name: "Puppy Training Pads (30pc)", price: "Rs. 990" },
];

export const fashionWear: HomeProduct[] = [
  { name: "Dog Knit Sweater", price: "Rs. 950", badge: "New", badgeColor: "#1996C8" },
  { name: "Pet Raincoat", price: "Rs. 1,150" },
  { name: "Cat Bandana Set", price: "Rs. 320" },
  { name: "Winter Puppy Hoodie", price: "Rs. 1,050", badge: "Sale", badgeColor: "#D64545" },
  { name: "Festive Bowtie Collar", price: "Rs. 380" },
  { name: "Dog Denim Jacket", price: "Rs. 1,300" },
];

export const petToys: HomeProduct[] = [
  { name: "Rope Tug Toy", price: "Rs. 350", badge: "New", badgeColor: "#1996C8" },
  { name: "Cat Feather Wand", price: "Rs. 240" },
  { name: "Interactive Ball Feeder", price: "Rs. 720" },
  { name: "Squeaky Plush Toy", price: "Rs. 290", badge: "Sale", badgeColor: "#D64545" },
  { name: "Catnip Mouse Toy Set", price: "Rs. 260" },
  { name: "Puzzle Treat Dispenser", price: "Rs. 850" },
];

export const groomingAccessories: HomeProduct[] = [
  { name: "Pet Shampoo 250ml", price: "Rs. 420" },
  { name: "Dog Grooming Brush", price: "Rs. 480" },
  { name: "Deshedding Tool", price: "Rs. 850", badge: "New", badgeColor: "#1996C8" },
  { name: "Nail Clipper Set", price: "Rs. 390" },
  { name: "Grooming Wipes (50pc)", price: "Rs. 350" },
  { name: "Detangling Comb", price: "Rs. 300", badge: "Sale", badgeColor: "#D64545" },
];

export const brands = ["Focus", "Bairo", "Himalaya", "Whiskas", "Pedigree", "Royal Canin", "ProLine", "Reflex"];

export const testimonials = [
  {
    quote:
      "The vet was on time and friendly with my dog — it responded to treatment right away. Will use this service again.",
    name: "Lin Hollywood",
  },
  {
    quote: "They treat every pet like family. Timely, exceptional service — highly recommend for anything your pet needs.",
    name: "Aarya Acharya",
  },
  {
    quote: "Wonderful visit for our dog. Reasonable prices and great staff — thank you for the good service.",
    name: "Sanju Timalsina",
  },
];

// "Latest from the Blog" rail now reads live from BlogContext (src/context/BlogContext.tsx)
// via src/components/LatestBlogRail.tsx, linking into the public /blog detail pages.

// Footer "Our Services" links now read live from ServiceContext (src/context/ServiceContext.tsx)
// via src/components/SiteFooter.tsx, linking into the public /services detail pages.

export const footerGeneralLinks = [
  { label: "About Us", href: "/about" },
  { label: "Career", href: "/career" },
  { label: "Pet Tag Archive", href: "/pet-tag-archive" },
  { label: "Microchipping Archive", href: "/microchipping-archive" },
  { label: "Dog Breed Archive" },
  { label: "Terms & Conditions" },
  { label: "Privacy Policy" },
];

export const footerQuickLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Pets Available", href: "/pets" },
  { label: "Adoption", href: "/adoption" },
  { label: "Web Vet", href: "/vet" },
];
