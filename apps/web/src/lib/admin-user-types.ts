export type AdminUserPerms = {
  dashboard: boolean;
  deliveries: boolean;
  vetconsults: boolean;
  shop: boolean;
  finance: boolean;
  users: boolean;
};

export type AdminUserRole = "Admin" | "Manager" | "Staff" | "B2B User";

export type AdminUser = {
  name: string;
  email: string;
  password: string;
  role: AdminUserRole;
  active: boolean;
  perms: AdminUserPerms;
};

export const permKeys: (keyof AdminUserPerms)[] = ["dashboard", "deliveries", "vetconsults", "shop", "finance", "users"];

export const permLabels: Record<keyof AdminUserPerms, string> = {
  dashboard: "Dashboard",
  deliveries: "Deliveries",
  vetconsults: "Vet Consults",
  shop: "Shop",
  finance: "Finance",
  users: "Users",
};

export const adminRoles: AdminUserRole[] = ["Admin", "Manager", "Staff", "B2B User"];
