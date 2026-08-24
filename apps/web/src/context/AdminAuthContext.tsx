"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { adminUserSeed, rolePermsSeed } from "@/lib/admin-user-seed";
import type { AdminUser, AdminUserPerms, AdminUserRole } from "@/lib/admin-user-types";

const USERS_KEY = "cph_admin_users";
const ROLE_PERMS_KEY = "cph_admin_role_perms";
const SESSION_KEY = "cph_admin_session";

function loadUsers(): AdminUser[] {
  const raw = window.localStorage.getItem(USERS_KEY);
  if (!raw) return adminUserSeed;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : adminUserSeed;
  } catch {
    return adminUserSeed;
  }
}

function loadRolePerms(): Record<AdminUserRole, AdminUserPerms> {
  const raw = window.localStorage.getItem(ROLE_PERMS_KEY);
  if (!raw) return rolePermsSeed;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? { ...rolePermsSeed, ...parsed } : rolePermsSeed;
  } catch {
    return rolePermsSeed;
  }
}

// Older builds stored the full session user object as JSON; now only the email is stored
// and the live user record is resolved from the users list on every load.
function loadSessionEmail(): string | null {
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.email) return parsed.email;
  } catch {
    // not JSON — already a plain email string
  }
  return raw;
}

type AdminAuthValue = {
  user: AdminUser | null;
  users: AdminUser[];
  rolePerms: Record<AdminUserRole, AdminUserPerms>;
  ready: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addUser: (input: Omit<AdminUser, "active">) => { ok: true } | { ok: false; error: string };
  updateUser: (email: string, patch: Partial<Omit<AdminUser, "email">>) => void;
  removeUser: (email: string) => void;
  toggleUserActive: (email: string) => void;
  toggleRolePerm: (role: AdminUserRole, key: keyof AdminUserPerms) => void;
};

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{
    users: AdminUser[];
    rolePerms: Record<AdminUserRole, AdminUserPerms>;
    sessionEmail: string | null;
    ready: boolean;
  }>({ users: adminUserSeed, rolePerms: rolePermsSeed, sessionEmail: null, ready: false });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ users: loadUsers(), rolePerms: loadRolePerms(), sessionEmail: loadSessionEmail(), ready: true });
  }, []);

  const persistUsers = (users: AdminUser[]) => {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
    setState((s) => ({ ...s, users }));
  };

  const persistRolePerms = (rolePerms: Record<AdminUserRole, AdminUserPerms>) => {
    window.localStorage.setItem(ROLE_PERMS_KEY, JSON.stringify(rolePerms));
    setState((s) => ({ ...s, rolePerms }));
  };

  const login = (email: string, password: string) => {
    const match = state.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password && u.active
    );
    if (!match) return false;
    try {
      window.localStorage.setItem(SESSION_KEY, match.email);
    } catch {
      // Storage is full elsewhere on the site -- still let this tab's session through so the
      // admin isn't locked out entirely; they just won't stay signed in on a future visit.
    }
    setState((s) => ({ ...s, sessionEmail: match.email }));
    return true;
  };

  const logout = () => {
    window.localStorage.removeItem(SESSION_KEY);
    setState((s) => ({ ...s, sessionEmail: null }));
  };

  const addUser = (input: Omit<AdminUser, "active">): { ok: true } | { ok: false; error: string } => {
    if (state.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      return { ok: false, error: "A user with that email already exists." };
    }
    persistUsers([...state.users, { ...input, active: true }]);
    return { ok: true };
  };

  const updateUser = (email: string, patch: Partial<Omit<AdminUser, "email">>) => {
    persistUsers(state.users.map((u) => (u.email === email ? { ...u, ...patch } : u)));
  };

  const removeUser = (email: string) => {
    persistUsers(state.users.filter((u) => u.email !== email));
  };

  const toggleUserActive = (email: string) => {
    persistUsers(state.users.map((u) => (u.email === email ? { ...u, active: !u.active } : u)));
  };

  const toggleRolePerm = (role: AdminUserRole, key: keyof AdminUserPerms) => {
    persistRolePerms({ ...state.rolePerms, [role]: { ...state.rolePerms[role], [key]: !state.rolePerms[role][key] } });
  };

  const user = state.sessionEmail ? (state.users.find((u) => u.email === state.sessionEmail) ?? null) : null;

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        users: state.users,
        rolePerms: state.rolePerms,
        ready: state.ready,
        login,
        logout,
        addUser,
        updateUser,
        removeUser,
        toggleUserActive,
        toggleRolePerm,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
