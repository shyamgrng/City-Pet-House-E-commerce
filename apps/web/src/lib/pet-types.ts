export type PetStatus = "Available" | "Reserved" | "Sold";

export const PET_PHOTO_SLOTS = 4;

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
  /** Always PET_PHOTO_SLOTS entries; "" for an empty slot. */
  photos: string[];
  /** Index into photos[] of the photo shown as the listing's cover/lead image. */
  coverPhotoIndex: number;
  video: string;
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

/** The photo actually shown for a pet — its chosen cover photo, or the first non-empty slot. */
export function coverPhoto(pet: Pick<Pet, "photos" | "coverPhotoIndex">): string {
  return pet.photos[pet.coverPhotoIndex] || pet.photos.find(Boolean) || "";
}
