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
  postedDaysAgo: number;
  adopted: boolean;
  ownerId?: string;
};

export function daysLeft(post: AdoptionPost) {
  return Math.max(0, 15 - post.postedDaysAgo);
}

export function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
