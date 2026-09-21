// Matches shopCategories in apps/web/src/lib/catalog-types.ts exactly.
export const SHOP_CATEGORIES = ["Pet Food", "Pet Accessories", "Fashion Wear", "Pet Toys", "Pet Supplement", "Grooming Supplies"];

export const SHOP_BRANDS = ["Royal Canin", "Pedigree", "Whiskas", "Purina", "Drools"];

export type ShopProduct = {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  rating: number;
  hotSale?: boolean;
  hotDiscount?: number;
  newArrival?: boolean;
  outOfStock?: boolean;
};

export function salePrice(p: ShopProduct): number {
  return p.hotSale && p.hotDiscount ? Math.round(p.price * (1 - p.hotDiscount / 100)) : p.price;
}

export const SHOP_PRODUCTS: ShopProduct[] = [
  { id: "sp-1", name: "Royal Canin Adult Dog Food 3kg", category: "Pet Food", brand: "Royal Canin", price: 2400, rating: 4 },
  { id: "sp-2", name: "Royal Canin Kitten Food 1kg", category: "Pet Food", brand: "Royal Canin", price: 1350, rating: 5 },
  { id: "sp-3", name: "Whiskas Cat Food 1.2kg", category: "Pet Food", brand: "Whiskas", price: 950, rating: 5 },
  { id: "sp-4", name: "Pedigree Puppy Food 3kg", category: "Pet Food", brand: "Pedigree", price: 1800, rating: 0, newArrival: true },
  { id: "sp-5", name: "Purina Kitten Food 1kg", category: "Pet Food", brand: "Purina", price: 1100, rating: 3 },
  { id: "sp-6", name: "Drools Adult Dog Food 4kg", category: "Pet Food", brand: "Drools", price: 2100, rating: 4, hotSale: true, hotDiscount: 20 },

  { id: "sp-7", name: "Adjustable Nylon Collar", category: "Pet Accessories", brand: "Pedigree", price: 450, rating: 0 },
  { id: "sp-8", name: "Retractable Leash 5m", category: "Pet Accessories", brand: "Royal Canin", price: 850, rating: 4 },
  { id: "sp-9", name: "Stainless Steel Food Bowl", category: "Pet Accessories", brand: "Whiskas", price: 350, rating: 0 },
  { id: "sp-10", name: "Pet Carrier Bag", category: "Pet Accessories", brand: "Purina", price: 2200, rating: 0, outOfStock: true },

  { id: "sp-11", name: "Winter Sweater for Dogs", category: "Fashion Wear", brand: "Pedigree", price: 900, rating: 0 },
  { id: "sp-12", name: "Raincoat with Hood", category: "Fashion Wear", brand: "Royal Canin", price: 1200, rating: 0 },
  { id: "sp-13", name: "Bandana Set (3pc)", category: "Fashion Wear", brand: "Drools", price: 400, rating: 0 },

  { id: "sp-14", name: "Squeaky Chew Toy", category: "Pet Toys", brand: "Pedigree", price: 380, rating: 0 },
  { id: "sp-15", name: "Interactive Puzzle Feeder", category: "Pet Toys", brand: "Purina", price: 1050, rating: 5 },
  { id: "sp-16", name: "Rope Tug Toy", category: "Pet Toys", brand: "Drools", price: 320, rating: 0 },

  { id: "sp-17", name: "Joint Care Supplement Tablets", category: "Pet Supplement", brand: "Royal Canin", price: 1650, rating: 4 },
  { id: "sp-18", name: "Omega-3 Skin & Coat Oil", category: "Pet Supplement", brand: "Whiskas", price: 1200, rating: 0 },

  { id: "sp-19", name: "Slicker Brush", category: "Grooming Supplies", brand: "Pedigree", price: 550, rating: 0 },
  { id: "sp-20", name: "Pet Shampoo 250ml", category: "Grooming Supplies", brand: "Purina", price: 700, rating: 0 },
  { id: "sp-21", name: "Nail Clipper Set", category: "Grooming Supplies", brand: "Drools", price: 480, rating: 0 },
  { id: "sp-22", name: "Deshedding Tool", category: "Grooming Supplies", brand: "Royal Canin", price: 950, rating: 0 },
];
