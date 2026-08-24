export type PetStatus = "Available" | "Reserved" | "Sold";

export const PET_PHOTO_SLOTS = 4;

// Standard puppy vaccination schedule (7 doses) and deworming schedule (4 doses).
export const vaccineStages = [
  "6–8 wks: DHPPi (1st dose)",
  "9–11 wks: DHPPi (2nd dose)",
  "12–14 wks: DHPPi (3rd dose) + Leptospirosis",
  "14–16 wks: Rabies (1st dose)",
  "16–18 wks: DHPPi (4th dose / booster)",
  "6 months: Rabies booster",
  "12 months: Annual booster (DHPPi + Rabies)",
] as const;

export const dewormStages = ["2 weeks", "4 weeks", "6 weeks", "8 weeks"] as const;

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
  /** Aligned to photos[] — alt text for each photo (accessibility + shown if a photo fails to load). */
  photoAlts: string[];
  /** Index into photos[] of the photo shown as the listing's cover/lead image. */
  coverPhotoIndex: number;
  video: string;
  /** Aligned to vaccineStages — which doses this pet has received. */
  vaccinations: boolean[];
  /** Aligned to dewormStages — which doses this pet has received. */
  dewormings: boolean[];
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

/** Alt text for the cover photo returned by coverPhoto(), aligned by the same index lookup. */
export function coverPhotoAlt(pet: Pick<Pet, "photos" | "photoAlts" | "coverPhotoIndex">): string {
  if (pet.photos[pet.coverPhotoIndex]) return pet.photoAlts[pet.coverPhotoIndex] || "";
  const i = pet.photos.findIndex(Boolean);
  return i >= 0 ? pet.photoAlts[i] || "" : "";
}
