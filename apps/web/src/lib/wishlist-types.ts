export type WishlistItem = {
  id: string;
  kind: "product" | "pet";
  name: string;
  priceLabel: string;
  href: string;
};
