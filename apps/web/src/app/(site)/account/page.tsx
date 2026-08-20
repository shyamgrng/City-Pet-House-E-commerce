"use client";

import Link from "next/link";
import { useState } from "react";
import { useAdoption } from "@/context/AdoptionContext";
import { useAuth } from "@/context/AuthContext";
import { useOrder } from "@/context/OrderContext";
import { useVet } from "@/context/VetContext";
import { daysLeft, type AdoptionPost } from "@/lib/adoption-types";
import { formatRs } from "@/lib/catalog-types";
import { STATUS_COLORS as ORDER_STATUS_COLORS } from "@/lib/order-types";
import { STATUS_COLORS as VET_STATUS_COLORS } from "@/lib/vet-types";

const TABS = [
  { key: "wishlist", label: "Wishlist" },
  { key: "orders", label: "Orders" },
  { key: "vetconsults", label: "Web Vet" },
  { key: "adoption", label: "Adoption Posts" },
  { key: "profile", label: "Profile" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function AccountPage() {
  const { user, ready } = useAuth();
  const [tab, setTab] = useState<TabKey>("orders");

  if (!ready) return null;

  if (!user) {
    return (
      <div className="px-8 py-16 flex justify-center">
        <div className="max-w-[420px] w-full border border-[#E4E9EC] rounded-2xl p-8 text-center">
          <div className="font-heading font-bold text-lg text-[#1A2027] mb-2">My Account</div>
          <div className="text-[13px] text-[#5B6773] leading-relaxed mb-6">
            You need a free account to view your orders, vet consults, adoption posts and profile.
          </div>
          <Link
            href="/signin?redirect=/account"
            className="block w-full bg-primary text-white text-center py-3 rounded-[9px] text-sm font-semibold"
          >
            Sign In or Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-7 max-w-[800px]">
      <div className="font-heading font-bold text-xl text-[#1A2027] mb-4">My Account</div>

      <div className="flex gap-2 flex-wrap mb-[22px]">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-2.5 rounded-full text-xs font-semibold cursor-pointer border border-[#E4E9EC]"
            style={{ background: tab === t.key ? "#1996C8" : "#fff", color: tab === t.key ? "#fff" : "#3A4652" }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "wishlist" && (
        <Empty>No Item has been selected for your Wishlist</Empty>
      )}
      {tab === "orders" && <OrdersTab ownerId={user.id} />}
      {tab === "vetconsults" && <VetTab ownerId={user.id} />}
      {tab === "adoption" && <AdoptionTab ownerId={user.id} />}
      {tab === "profile" && <ProfileTab />}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="py-16 text-sm text-[#8A96A3] text-center">{children}</div>;
}

const STATUS_COLORS: Record<string, string> = { Active: "#C9962B", Adopted: "#1F7A4D" };

function OrdersTab({ ownerId }: { ownerId: string }) {
  const { orders } = useOrder();
  const mine = orders.filter((o) => o.ownerId === ownerId).sort((a, b) => b.createdAt - a.createdAt);

  if (mine.length === 0) {
    return <Empty>You haven&apos;t placed any orders yet</Empty>;
  }

  const fmtDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div>
      {mine.map((o) => (
        <Link key={o.id} href={`/order/${o.id}`} className="flex justify-between items-center py-3.5 border-b border-[#EEF1F3] last:border-0">
          <div>
            <div className="text-[13px] font-semibold text-[#1A2027]">{o.id}</div>
            <div className="text-xs text-[#8A96A3]">
              {fmtDate(o.createdAt)} · {formatRs(o.total)}
            </div>
          </div>
          <div className="text-[11px] font-semibold" style={{ color: ORDER_STATUS_COLORS[o.status] }}>
            {o.status}
          </div>
        </Link>
      ))}
    </div>
  );
}

function VetTab({ ownerId }: { ownerId: string }) {
  const { bookings } = useVet();
  const mine = bookings.filter((b) => b.ownerId === ownerId);

  if (mine.length === 0) {
    return <Empty>No vet consult bookings yet</Empty>;
  }

  return (
    <div>
      {mine.map((b) => (
        <Link
          key={b.id}
          href={`/vet/status/${b.id}`}
          className="flex justify-between items-center py-3.5 border-b border-[#EEF1F3] last:border-0"
        >
          <div>
            <div className="text-[13px] font-semibold text-[#1A2027]">{b.doctorName}</div>
            <div className="text-xs text-[#8A96A3]">
              {b.petName} · {b.instant ? "Online now" : `${b.scheduledDate} ${b.scheduledTime}`}
            </div>
          </div>
          <div className="text-[11px] font-semibold" style={{ color: VET_STATUS_COLORS[b.status] }}>
            {b.status}
          </div>
        </Link>
      ))}
    </div>
  );
}

function AdoptionTab({ ownerId }: { ownerId: string }) {
  const { posts, updatePost } = useAdoption();
  const [selected, setSelected] = useState<AdoptionPost | null>(null);
  const mine = posts.filter((p) => p.ownerId === ownerId);

  const current = selected ? (mine.find((p) => p.id === selected.id) ?? null) : null;

  if (current) {
    const status = current.adopted ? "Adopted" : "Active";
    return (
      <div>
        <div onClick={() => setSelected(null)} className="text-[13px] text-primary font-semibold cursor-pointer mb-4">
          ← Back to Adoption Posts
        </div>
        <div className="flex justify-between items-center mb-2">
          <div className="text-[15px] font-bold text-[#1A2027]">
            {current.name} · {current.breed}
          </div>
          <div className="text-[11px] font-semibold" style={{ color: STATUS_COLORS[status] }}>
            {status}
          </div>
        </div>
        <div className="text-xs text-[#8A96A3] mb-3.5">{daysLeft(current)} days left</div>
        <div className="bg-[#F7F9FA] border border-[#E4E9EC] rounded-[10px] px-3.5 py-3 mb-3.5 text-xs text-[#3A4652] leading-loose">
          <div>
            <strong>Sex:</strong> {current.sex}
          </div>
          <div>
            <strong>Age:</strong> {current.age}
          </div>
          <div>
            <strong>Vaccination:</strong> {current.vaccination}
          </div>
          <div>
            <strong>Address:</strong> {current.address}
          </div>
          <div>
            <strong>Description:</strong> {current.desc}
          </div>
        </div>
        <div
          onClick={() => updatePost(current.id, { ...current, adopted: !current.adopted })}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div
            className="w-4 h-4 rounded flex items-center justify-center shrink-0"
            style={{ border: "2px solid #1F7A4D", background: current.adopted ? "#1F7A4D" : "transparent" }}
          >
            {current.adopted && <div className="text-white text-[11px] font-bold">✓</div>}
          </div>
          <div className="text-xs text-[#1F7A4D] font-semibold">Mark as Adopted</div>
        </div>
      </div>
    );
  }

  if (mine.length === 0) {
    return <Empty>You haven&apos;t posted any adoption notices yet</Empty>;
  }

  return (
    <div>
      {mine.map((p) => {
        const status = p.adopted ? "Adopted" : "Active";
        return (
          <div
            key={p.id}
            onClick={() => setSelected(p)}
            className="flex justify-between items-center py-3.5 border-b border-[#EEF1F3] cursor-pointer last:border-0"
          >
            <div>
              <div className="text-[13px] font-semibold text-[#1A2027]">
                {p.name} · {p.breed}
              </div>
              <div className="text-xs text-[#8A96A3]">{daysLeft(p)} days left</div>
            </div>
            <div className="text-[11px] font-semibold" style={{ color: STATUS_COLORS[status] }}>
              {status}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProfileTab() {
  const { user, updateProfile, changePassword } = useAuth();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => ({ name: user!.name, email: user!.email, phone: user!.phone, address: user!.address }));

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saved, setSaved] = useState(false);
  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  if (!user) return null;

  const startEdit = () => {
    setDraft({ name: user.name, email: user.email, phone: user.phone, address: user.address });
    setEditing(true);
  };

  const save = () => {
    updateProfile(draft);
    setEditing(false);
  };

  const submitPasswordChange = () => {
    if (!newPassword || mismatch) return;
    changePassword(newPassword);
    setNewPassword("");
    setConfirmPassword("");
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      {!editing ? (
        <div className="border border-[#E4E9EC] rounded-xl p-5 max-w-[500px]">
          <div className="text-[13px] font-bold text-[#1A2027] mb-3.5 pb-2 border-b border-[#EEF1F3]">Personal Details</div>
          <Field label="Full Name" value={user.name} />
          <Field label="Email" value={user.email} />
          <Field label="Phone" value={user.phone} />
          <Field label="Address" value={user.address} last />
          <button
            onClick={startEdit}
            className="w-full mt-5 bg-primary text-white text-center py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <div className="border border-[#E4E9EC] rounded-xl p-5 max-w-[500px]">
          <div className="text-[13px] font-bold text-[#1A2027] mb-3.5 pb-2 border-b border-[#EEF1F3]">Personal Details</div>
          <EditField label="Full Name" value={draft.name} onChange={(v) => setDraft((d) => ({ ...d, name: v }))} />
          <EditField label="Email" value={draft.email} onChange={(v) => setDraft((d) => ({ ...d, email: v }))} />
          <EditField label="Phone" value={draft.phone} onChange={(v) => setDraft((d) => ({ ...d, phone: v }))} />
          <EditField label="Address" value={draft.address} onChange={(v) => setDraft((d) => ({ ...d, address: v }))} />
          <div className="flex gap-2.5 mt-2">
            <button onClick={save} className="flex-1 bg-primary text-white text-center py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer">
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-[18px] py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer bg-[#F0F2F4] text-[#5B6773]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="border border-[#E4E9EC] rounded-xl p-5 max-w-[440px] mt-4">
        <div className="text-sm font-bold text-[#1A2027] mb-3.5">Change Password</div>
        <div className="text-xs font-semibold text-[#3A4652] mb-1.5">New Password</div>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-2 box-border"
        />
        <div className="text-xs font-semibold text-[#3A4652] mb-1.5">Reconfirm Password</div>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-2 box-border"
        />
        {mismatch && <div className="text-[11px] text-[#D64545] mb-2.5">Passwords do not match</div>}
        {saved && <div className="text-[11px] text-[#1F7A4D] mb-2.5">✓ Password updated</div>}
        <button
          onClick={submitPasswordChange}
          className="w-full bg-primary text-white text-center py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer"
        >
          Update Password
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={last ? "" : "mb-3.5"}>
      <div className="text-[13px] text-[#8A96A3]">{label}</div>
      <div className="text-sm font-semibold text-[#1A2027]">{value}</div>
    </div>
  );
}

function EditField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <>
      <div className="text-xs font-semibold text-[#3A4652] mb-1.5">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-3 box-border"
      />
    </>
  );
}
