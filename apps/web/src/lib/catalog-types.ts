export type CourierPackageSize = "Small" | "Medium" | "Large" | "Very Large";

export type Product = {
  id: string;
  name: string;
  desc: string;
  photo: string;
  photos: string[];
  category: string;
  sku: string;
  brand: string;
  price: number;
  costPrice: number;
  qty: number;
  lowStockAlert: number;
  sizes: string[];
  colours: string[];
  suppliedBy: string;
  commissionPercent: number;
  courierPackageSize: CourierPackageSize;
  tags: string[];
  newArrival: boolean;
  hotSale: boolean;
  hotDiscount: number;
  todaysDeal: boolean;
  dealStart: string;
  dealEnd: string;
  outOfStock: boolean;
  status: "active" | "draft";
};

export const shopCategories = ["Pet Food", "Pet Accessories", "Fashion Wear", "Pet Toys", "Pet Supplement", "Grooming Supplies"];

export const brandNames = ["Focus", "Bairo", "Himalaya", "Whiskas", "Pedigree", "Royal Canin", "ProLine", "Reflex"];

export const sizeOptions = ["S", "M", "L", "XL", "XXL"];

export const colourOptions: { name: string; hex: string }[] = [
  { name: "Black", hex: "#1A2027" },
  { name: "White", hex: "#F5F6F7" },
  { name: "Red", hex: "#D64545" },
  { name: "Blue", hex: "#1996C8" },
  { name: "Green", hex: "#1F7A4D" },
  { name: "Brown", hex: "#8B5E3C" },
  { name: "Yellow", hex: "#C9962B" },
  { name: "Pink", hex: "#D66DA0" },
];

export const courierPackageSizes: CourierPackageSize[] = ["Small", "Medium", "Large", "Very Large"];

export function formatRs(n: number) {
  return "Rs. " + n.toLocaleString("en-IN");
}

export function salePrice(p: Product) {
  return p.hotSale ? Math.round(p.price * (1 - p.hotDiscount / 100)) : p.price;
}

export function isDealLive(p: Product) {
  if (!p.todaysDeal) return false;
  const now = Date.now();
  if (p.dealStart && now < new Date(p.dealStart).getTime()) return false;
  if (p.dealEnd && now > new Date(p.dealEnd).getTime()) return false;
  return true;
}

export function profitPerUnit(price: number, costPrice: number) {
  return price - costPrice;
}

export function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
