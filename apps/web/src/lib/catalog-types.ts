export type Product = {
  id: string;
  name: string;
  desc: string;
  category: string;
  brand: string;
  price: number;
  qty: number;
  badge: "" | "New" | "Sale";
  hotSale: boolean;
  hotDiscount: number;
  todaysDeal: boolean;
  outOfStock: boolean;
};

export const shopCategories = ["Pet Food", "Pet Accessories", "Fashion Wear", "Pet Toys", "Pet Supplement", "Grooming Supplies"];

export const brandNames = ["Focus", "Bairo", "Himalaya", "Whiskas", "Pedigree", "Royal Canin", "ProLine", "Reflex"];

export function formatRs(n: number) {
  return "Rs. " + n.toLocaleString("en-IN");
}

export function salePrice(p: Product) {
  return p.hotSale ? Math.round(p.price * (1 - p.hotDiscount / 100)) : p.price;
}

export function badgeColor(badge: Product["badge"]) {
  return badge === "Sale" ? "#D64545" : "#1996C8";
}

export function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
