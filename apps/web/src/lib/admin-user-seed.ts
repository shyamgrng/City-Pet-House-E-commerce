import type { AdminUser, AdminUserPerms, AdminUserRole } from "@/lib/admin-user-types";

export const adminUserSeed: AdminUser[] = [
  {
    name: "Admin User",
    email: "admin@citypethouse.com",
    password: "admin123",
    role: "Admin",
    active: true,
    perms: { dashboard: true, deliveries: true, vetconsults: true, shop: true, finance: true, users: true },
  },
  {
    name: "Sabin Karki",
    email: "sabin@citypethouse.com",
    password: "staff123",
    role: "Staff",
    active: true,
    perms: { dashboard: true, deliveries: true, vetconsults: true, shop: true, finance: false, users: false },
  },
];

export const rolePermsSeed: Record<AdminUserRole, AdminUserPerms> = {
  Admin: { dashboard: true, deliveries: true, vetconsults: true, shop: true, finance: true, users: true },
  Manager: { dashboard: true, deliveries: true, vetconsults: true, shop: true, finance: true, users: false },
  Staff: { dashboard: true, deliveries: true, vetconsults: true, shop: true, finance: false, users: false },
  "B2B User": { dashboard: false, deliveries: false, vetconsults: false, shop: true, finance: false, users: false },
};
