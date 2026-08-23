"use client";

import { useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { adminRoles, permKeys, permLabels, type AdminUser, type AdminUserRole } from "@/lib/admin-user-types";

type UserForm = { name: string; email: string; password: string; role: AdminUserRole; perms: AdminUser["perms"] };

const EMPTY_FORM: UserForm = {
  name: "",
  email: "",
  password: "",
  role: "Staff",
  perms: { dashboard: true, deliveries: true, vetconsults: true, shop: true, finance: false, users: false },
};

export default function UsersPage() {
  const { user: currentUser, users, rolePerms, addUser, updateUser, removeUser, toggleUserActive, toggleRolePerm } = useAdminAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>(EMPTY_FORM);
  const [error, setError] = useState("");

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingEmail(null);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (u: AdminUser) => {
    setForm({ name: u.name, email: u.email, password: "", role: u.role, perms: { ...u.perms } });
    setEditingEmail(u.email);
    setError("");
    setModalOpen(true);
  };

  const save = () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError("Please fill in name and email.");
      return;
    }
    if (!editingEmail && !form.password.trim()) {
      setError("Please set a password for this login.");
      return;
    }
    if (editingEmail) {
      const patch: Partial<Omit<AdminUser, "email">> = { name: form.name.trim(), role: form.role, perms: form.perms };
      if (form.password.trim()) patch.password = form.password.trim();
      updateUser(editingEmail, patch);
      setModalOpen(false);
    } else {
      const result = addUser({ name: form.name.trim(), email: form.email.trim(), password: form.password.trim(), role: form.role, perms: form.perms });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setModalOpen(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-1">
        <div>
          <div className="font-heading font-bold text-[19px] text-[#1A2027]">Users</div>
          <div className="text-xs text-[#5B6773] mt-0.5">Create admin/staff users and control what each role can access.</div>
        </div>
        <button onClick={openAdd} className="bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-lg cursor-pointer whitespace-nowrap">
          + Add User
        </button>
      </div>

      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden mb-6 mt-4">
        <div className="grid grid-cols-4 px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
          <div>User</div>
          <div>Role</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
        {users.length === 0 ? (
          <div className="text-center text-xs text-[#8A96A3] py-6">No users added yet</div>
        ) : (
          users.map((u) => (
            <div key={u.email} className="grid grid-cols-4 px-4 py-3.5 text-xs items-center border-b border-[#F0F2F4] last:border-0">
              <div>
                <div className="font-bold text-[#1A2027]">{u.name}</div>
                <div className="text-[#8A96A3]">{u.email}</div>
              </div>
              <div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#EAF4F9] text-primary">{u.role}</span>
              </div>
              <div className="font-semibold" style={{ color: u.active ? "#1F7A4D" : "#8A96A3" }}>
                {u.active ? "Active" : "Disabled"}
              </div>
              <div className="flex gap-3 font-semibold">
                <span onClick={() => openEdit(u)} className="text-primary cursor-pointer">
                  Edit
                </span>
                {u.email === currentUser?.email ? (
                  <span className="text-[#C7CDD3]" title="You can't disable or remove your own account">
                    (you)
                  </span>
                ) : (
                  <>
                    <span onClick={() => toggleUserActive(u.email)} className="text-[#C9962B] cursor-pointer">
                      {u.active ? "Disable" : "Enable"}
                    </span>
                    <span onClick={() => removeUser(u.email)} className="text-[#D64545] cursor-pointer">
                      Remove
                    </span>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="text-[13px] font-bold text-[#1A2027] mb-2">Roles &amp; Permissions</div>
      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
        <div className="grid grid-cols-7 px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
          <div>Role</div>
          {permKeys.map((k) => (
            <div key={k}>{permLabels[k]}</div>
          ))}
        </div>
        {adminRoles.map((role) => (
          <div key={role} className="grid grid-cols-7 px-4 py-3.5 text-xs items-center border-b border-[#F0F2F4] last:border-0">
            <div className="font-bold text-[#1A2027]">{role}</div>
            {permKeys.map((k) => (
              <div
                key={k}
                onClick={() => toggleRolePerm(role, k)}
                className="cursor-pointer text-sm"
                style={{ color: rolePerms[role][k] ? "#1F7A4D" : "#D64545" }}
              >
                {rolePerms[role][k] ? "✓" : "✕"}
              </div>
            ))}
          </div>
        ))}
      </div>

      {modalOpen && (
        <div onClick={() => setModalOpen(false)} className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-[420px] max-w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="text-[15px] font-bold text-[#1A2027]">{editingEmail ? "Edit User" : "Add User"}</div>
              <div onClick={() => setModalOpen(false)} className="text-base text-[#8A96A3] cursor-pointer">
                ✕
              </div>
            </div>

            <div className="text-xs font-semibold text-[#3A4652] mb-1.5">Full Name *</div>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-3 box-border"
            />

            <div className="text-xs font-semibold text-[#3A4652] mb-1.5">Email *</div>
            <input
              value={form.email}
              disabled={!!editingEmail}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-3 box-border disabled:bg-[#F7F9FA] disabled:text-[#8A96A3]"
            />

            <div className="text-xs font-semibold text-[#3A4652] mb-1.5">
              Password {editingEmail ? "(leave blank to keep current)" : "*"}
            </div>
            <input
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Set a login password"
              className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-3 box-border"
            />

            <div className="text-xs font-semibold text-[#3A4652] mb-2">Role Label</div>
            <div className="flex gap-2 bg-[#F0F2F4] rounded-lg p-1 mb-4">
              {adminRoles.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, role: r }))}
                  className="flex-1 text-center py-2 px-1 rounded-md text-[11px] font-semibold cursor-pointer"
                  style={{ background: form.role === r ? "#1996C8" : "transparent", color: form.role === r ? "#fff" : "#5B6773" }}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="text-xs font-semibold text-[#3A4652] mb-2">Access</div>
            <div className="flex flex-col gap-0.5 mb-4">
              {permKeys.map((k) => (
                <div
                  key={k}
                  onClick={() => setForm((f) => ({ ...f, perms: { ...f.perms, [k]: !f.perms[k] } }))}
                  className="flex items-center gap-2.5 py-2 cursor-pointer"
                >
                  <div
                    className="w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center text-xs text-white shrink-0"
                    style={{ background: form.perms[k] ? "#1996C8" : "#fff", borderColor: "#C7CDD3" }}
                  >
                    {form.perms[k] ? "✓" : ""}
                  </div>
                  <div className="text-[13px] text-[#1A2027]">{permLabels[k]}</div>
                </div>
              ))}
            </div>

            {error && <div className="text-xs text-[#D64545] mb-2.5">{error}</div>}
            <button onClick={save} className="w-full bg-primary text-white text-center py-3 rounded-lg text-sm font-bold cursor-pointer">
              {editingEmail ? "Save Changes" : "Add User"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
