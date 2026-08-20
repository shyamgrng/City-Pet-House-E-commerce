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

/** Doctor accounts store a full name with qualification (e.g. "Dr. Sujata Rai, BVSc & AH")
 * while blog posts store a shorter byline (e.g. "Dr. Sujata Rai") — match on prefix. */
export function isAuthoredBy(postAuthor: string, doctorName: string) {
  return doctorName.toLowerCase().startsWith(postAuthor.trim().toLowerCase());
}
