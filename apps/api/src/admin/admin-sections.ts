/** Mirrors the prototype's rolePerms sections (dashboard/deliveries/vetconsults/shop/finance/users). */
export const ADMIN_SECTIONS = ["dashboard", "deliveries", "vetconsults", "shop", "finance", "users"] as const;
export type AdminSection = (typeof ADMIN_SECTIONS)[number];
