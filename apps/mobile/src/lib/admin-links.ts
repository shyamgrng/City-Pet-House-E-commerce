// Maps each "..." menu page to its content editor on the website's admin dashboard
// (apps/web/src/app/admin/(dashboard)/pages/*), so staff can jump from the mobile
// page straight to editing it. Dog Adoption and Admin Login have no matching editor
// (see apps/web/src/lib/admin-data.ts pageEditorList) and are left out on purpose.

export const SITE_URL = "https://citypethouseweb.vercel.app";

export const ADMIN_PAGE_PATHS: Record<string, string> = {
  services: "/admin/pages/services",
  blog: "/admin/pages/blog",
  careers: "/admin/pages/career",
  faq: "/admin/pages/faq",
  "how-to-buy": "/admin/pages/how-to-buy",
  "pet-tag-archive": "/admin/pages/pet-tag-archive",
  "microchipping-archive": "/admin/pages/microchipping-archive",
  terms: "/admin/pages/terms",
  privacy: "/admin/pages/privacy",
  refund: "/admin/pages/refund",
};

export function adminUrlFor(pageKey: string): string | undefined {
  const path = ADMIN_PAGE_PATHS[pageKey];
  return path ? `${SITE_URL}${path}` : undefined;
}
