// Maps each "..." menu page to its matching page on the website's admin dashboard,
// so staff can jump from the mobile page straight to editing/managing it. Most map
// to a content editor (apps/web/src/app/admin/(dashboard)/pages/*, see
// apps/web/src/lib/admin-data.ts pageEditorList); Dog Adoption maps to the
// Pet Available admin page (which also manages adoption posts), and Admin Login
// maps to the website's own admin sign-in.

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
  adoption: "/admin/pet-available",
  "admin-login": "/admin/login",
};

export function adminUrlFor(pageKey: string): string | undefined {
  const path = ADMIN_PAGE_PATHS[pageKey];
  return path ? `${SITE_URL}${path}` : undefined;
}
