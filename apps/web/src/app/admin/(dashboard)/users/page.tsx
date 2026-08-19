import { adminUsers, rolePerms, roleColumns } from "@/lib/admin-data";

export default function UsersPage() {
  return (
    <div>
      <div className="flex justify-between items-start mb-1">
        <div className="font-heading font-bold text-[19px] text-[#1A2027]">Users</div>
        <button className="bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-lg cursor-pointer">+ Add User</button>
      </div>
      <div className="text-xs text-[#5B6773] mb-4">Create admin/staff users and control what each role can access.</div>

      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden mb-6">
        <div className="grid grid-cols-4 px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
          <div>User</div>
          <div>Role</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
        {adminUsers.map((u) => (
          <div key={u.email} className="grid grid-cols-4 px-4 py-3.5 text-xs items-center border-b border-[#F0F2F4] last:border-0">
            <div>
              <div className="font-bold text-[#1A2027]">{u.name}</div>
              <div className="text-[#8A96A3]">{u.email}</div>
            </div>
            <div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#EAF4F9] text-primary">{u.role}</span>
            </div>
            <div className="font-semibold text-[#1F7A4D]">{u.status}</div>
            <div className="flex gap-3 font-semibold">
              <span className="text-primary cursor-pointer">Edit</span>
              <span className="text-[#C9962B] cursor-pointer">Disable</span>
              <span className="text-[#D64545] cursor-pointer">Remove</span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-[13px] font-bold text-[#1A2027] mb-2">Roles &amp; Permissions</div>
      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
        <div className="grid grid-cols-7 px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
          <div>Role</div>
          {roleColumns.map((c) => (
            <div key={c}>{c}</div>
          ))}
        </div>
        {rolePerms.map((r) => (
          <div key={r.role} className="grid grid-cols-7 px-4 py-3.5 text-xs items-center border-b border-[#F0F2F4] last:border-0">
            <div className="font-bold text-[#1A2027]">{r.role}</div>
            {r.perms.map((p, i) => (
              <div key={i} className={p ? "text-[#1F7A4D]" : "text-[#D64545]"}>
                {p ? "✓" : "✕"}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
