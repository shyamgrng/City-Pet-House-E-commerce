export type BlogPost = {
  id: string;
  title: string;
  date: string;
  author: string;
  isDoctorPost: boolean;
  excerpt: string;
  content: string;
};

export function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
