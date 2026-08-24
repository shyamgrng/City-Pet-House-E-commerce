export type AdoptionPost = {
  id: string;
  photo: string;
  photoAlt: string;
  name: string;
  breed: string;
  age: string;
  sex: string;
  vaccination: string;
  address: string;
  desc: string;
  contact: string;
  /** When the notice went live (ms epoch) — the listing expires 15 days after this. */
  postedAt: number;
  adopted: boolean;
  ownerId?: string;
};

const LISTING_DAYS = 15;
const DAY_MS = 24 * 60 * 60 * 1000;

export function daysLeft(post: Pick<AdoptionPost, "postedAt">) {
  const elapsedDays = Math.floor((Date.now() - post.postedAt) / DAY_MS);
  return Math.max(0, LISTING_DAYS - elapsedDays);
}

export function isExpired(post: Pick<AdoptionPost, "postedAt">) {
  return daysLeft(post) <= 0;
}

export function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
