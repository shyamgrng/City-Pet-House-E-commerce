export type PetStatus = "Available" | "Reserved" | "Sold";

export type Pet = {
  id: string;
  breed: string;
  species: string;
  sex: string;
  age: string;
  price: number;
  deliveryFee: number;
  tags: string[];
  status: PetStatus;
  photos: number;
  videos: number;
};

export const petSpeciesList = ["Dog", "Cat", "Small Pets", "Birds", "Fish"];

export function formatRs(n: number) {
  return "Rs. " + n.toLocaleString("en-IN");
}

export function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
