"use client";

import { useRef, useState } from "react";
import EmailInput from "@/components/EmailInput";
import PhoneInput from "@/components/PhoneInput";
import { useCourierAuth } from "@/context/CourierAuthContext";
import type { Delivery } from "@/lib/delivery-types";
import { isValidEmail } from "@/lib/email-format";
import { DOCUMENT_UPLOAD_ACCEPT, isAllowedDocumentFile, isAllowedImageFile, readDocumentFile, resizeImageFile } from "@/lib/image-upload";
import { isValidNepalPhone, phoneDigits } from "@/lib/phone";

type ActivityCategory = "Financial" | "Login" | "Delivery";
type ActivityEntry = { key: string; text: string; time: number; category: ActivityCategory };

const ACTIVITY_CATEGORY_COLORS: Record<ActivityCategory, string> = {
  Delivery: "#1996C8",
  Financial: "#C9962B",
  Login: "#7A56C8",
};

const COURIER_DOCUMENTS: { field: "businessDocument" | "ownerIdDocument"; label: string }[] = [
  { field: "businessDocument", label: "Business Registration Document" },
  { field: "ownerIdDocument", label: "Owner's National ID" },
];

/** Mirrors buildCourierActivity in admin/accounts/page.tsx so the courier's own Account tab shows
 * the same categorized feed the admin sees for this account. */
function buildActivity(courierId: string, deliveries: Delivery[], securityLog: { text: string; time: number }[] | undefined): ActivityEntry[] {
  const entries: ActivityEntry[] = [];
  const fmtMoney = (n: number) => "Rs. " + n.toLocaleString("en-IN");

  for (const d of deliveries.filter((d) => d.courierId === courierId)) {
    entries.push({
      key: `${d.id}-assigned`,
      text: `Delivery assigned for ${d.client} — ${fmtMoney(d.amount)}`,
      time: d.dispatchedAt ?? 0,
      category: "Delivery",
    });
    if (d.status === "Delivered" && d.deliveredAt) {
      entries.push({ key: `${d.id}-delivered`, text: `Delivered to ${d.client} — earned ${fmtMoney(d.amount)}`, time: d.deliveredAt, category: "Financial" });
    } else if (d.status === "Cancelled") {
      entries.push({
        key: `${d.id}-cancelled`,
        text: `Delivery cancelled for ${d.client}${d.cancelReason ? ` — ${d.cancelReason}` : ""}`,
        time: d.dispatchedAt ?? 0,
        category: "Delivery",
      });
    }
  }

  for (const e of securityLog ?? []) {
    entries.push({ key: `sec-${e.time}-${e.text}`, text: e.text, time: e.time, category: "Login" });
  }

  return entries.sort((a, b) => b.time - a.time);
}

export default function AccountTab({ deliveries }: { deliveries: Delivery[] }) {
  const { courier, updateProfile, updateDocument, changePassword } = useCourierAuth();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<{
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    altPhone: string;
    address: string;
  } | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  const [activityQuery, setActivityQuery] = useState("");
  const [activityFrom, setActivityFrom] = useState("");
  const [activityTo, setActivityTo] = useState("");

  if (!courier) return null;

  const startEdit = () => {
    setDraft({
      companyName: courier.companyName,
      contactPerson: courier.contactPerson ?? "",
      email: courier.email,
      phone: courier.phone,
      altPhone: courier.altPhone,
      address: courier.address,
    });
    setEditing(true);
  };

  const canSaveProfile =
    !!draft &&
    draft.companyName.trim().length > 0 &&
    isValidEmail(draft.email) &&
    isValidNepalPhone(draft.phone) &&
    (phoneDigits(draft.altPhone).length === 0 || isValidNepalPhone(draft.altPhone));

  const saveProfile = () => {
    if (!draft || !canSaveProfile) return;
    updateProfile(draft);
    setEditing(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const submitPasswordChange = () => {
    if (!newPassword || mismatch) return;
    changePassword(newPassword);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  const mine = deliveries.filter((d) => d.courierId === courier.courierId);
  const active = mine.filter((d) => d.status !== "Delivered" && d.status !== "Cancelled");
  const delivered = mine.filter((d) => d.status === "Delivered");
  const totalReceivable = mine.filter((d) => d.status !== "Cancelled").reduce((sum, d) => sum + d.amount, 0);
  const totalDelivered = delivered.reduce((sum, d) => sum + d.amount, 0);
  const totalPending = active.reduce((sum, d) => sum + d.amount, 0);
  const fmt = (n: number) => "Rs. " + n.toLocaleString("en-IN");
  const fmtDate = (ts?: number) => (ts ? new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—");
  const fmtDateTime = (ts: number) => new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  const activity = buildActivity(courier.courierId, deliveries, courier.securityLog);
  const activityQ = activityQuery.trim().toLowerCase();
  const filteredActivity = activity.filter((a) => {
    if (activityQ && !a.text.toLowerCase().includes(activityQ)) return false;
    if (activityFrom && a.time < new Date(activityFrom).setHours(0, 0, 0, 0)) return false;
    if (activityTo && a.time > new Date(activityTo).setHours(23, 59, 59, 999)) return false;
    return true;
  });
  const activityFiltersActive = Boolean(activityQuery || activityFrom || activityTo);
  const clearActivityFilters = () => {
    setActivityQuery("");
    setActivityFrom("");
    setActivityTo("");
  };

  return (
    <div>
      {courier.mustChangePassword && (
        <div className="px-4 py-3 rounded-[10px] mb-4 bg-[#FDF3E7] border border-[#F0DCB8] text-[#8A5A00]">
          <div className="text-xs font-bold mb-0.5">Please set a new password</div>
          <div className="text-[11px]">An admin reset your password to a temporary one — set your own below to keep your account secure.</div>
        </div>
      )}

      <div className="flex gap-3.5 mb-5 flex-wrap">
        <Stat label="Total Order Value" value={fmt(totalReceivable)} color="#7A56C8" />
        <Stat label="Delivered" value={fmt(totalDelivered)} color="#1F7A4D" />
        <Stat label="In Progress" value={fmt(totalPending)} color="#D64545" />
      </div>

      <div className="border border-[#E4E9EC] rounded-xl p-5 mb-3.5 max-w-[720px]">
        <div className="flex justify-between items-center mb-3.5">
          <div className="text-[13px] font-bold text-[#1A2027]">Company Details</div>
          {!editing && (
            <button onClick={startEdit} className="text-[11px] font-semibold text-primary cursor-pointer">
              Edit
            </button>
          )}
        </div>

        {!editing ? (
          <div className="grid grid-cols-2 gap-3.5 text-xs">
            <Field label="Company Name" value={courier.companyName} />
            <Field label="Courier ID" value={courier.courierId} />
            <Field label="Contact Person" value={courier.contactPerson || "—"} />
            <Field label="Email" value={courier.email} />
            <Field label="Phone" value={courier.phone} />
            <Field label="Alternate Phone" value={courier.altPhone || "—"} />
            <Field label="Address" value={courier.address} />
          </div>
        ) : (
          draft && (
            <div className="text-xs">
              <EditField label="Company Name" value={draft.companyName} onChange={(v) => setDraft({ ...draft, companyName: v })} />
              <EditField label="Contact Person" value={draft.contactPerson} onChange={(v) => setDraft({ ...draft, contactPerson: v })} />
              <div className="mb-3">
                <div className="text-xs font-semibold text-[#3A4652] mb-1.5">Email</div>
                <EmailInput value={draft.email} onChange={(v) => setDraft({ ...draft, email: v })} />
              </div>
              <div className="mb-3">
                <div className="text-xs font-semibold text-[#3A4652] mb-1.5">Phone</div>
                <PhoneInput value={draft.phone} onChange={(v) => setDraft({ ...draft, phone: v })} />
              </div>
              <div className="mb-3">
                <div className="text-xs font-semibold text-[#3A4652] mb-1.5">Alternate Phone</div>
                <PhoneInput value={draft.altPhone} onChange={(v) => setDraft({ ...draft, altPhone: v })} />
              </div>
              <EditField label="Address" value={draft.address} onChange={(v) => setDraft({ ...draft, address: v })} />
              <div className="flex gap-2.5 mt-1">
                <button
                  onClick={saveProfile}
                  disabled={!canSaveProfile}
                  className="flex-1 bg-primary text-white text-center py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
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
          )
        )}
        {profileSaved && <div className="text-[11px] text-[#1F7A4D] mt-2.5">✓ Profile updated</div>}
      </div>

      <div className="flex gap-3.5 flex-wrap mb-3.5">
        <div className="flex-1 min-w-[280px] border border-[#E4E9EC] rounded-xl p-5">
          <div className="text-[13px] font-bold text-[#1A2027] mb-1">Delivery Pricing</div>
          <div className="text-[11px] text-[#8A96A3] mb-3.5">Set by City Pet House admin — contact them to change your rates.</div>
          <div className="grid grid-cols-2 gap-2.5 mb-2.5">
            <PricingField label="Small" value={courier.priceSmall} />
            <PricingField label="Medium" value={courier.priceMedium} />
            <PricingField label="Large" value={courier.priceLarge} />
            <PricingField label="Very Large" value={courier.priceVeryLarge} />
          </div>
          {courier.usesDistancePricing ? (
            <div className="grid grid-cols-2 gap-2.5">
              <PricingField label="Rate per Kg" value={courier.ratePerKg} />
              <PricingField label="Rate per Km" value={courier.ratePerKm} />
            </div>
          ) : (
            courier.defaultFlatPrice > 0 && <PricingField label="Default Flat Price" value={courier.defaultFlatPrice} />
          )}
        </div>

        <div className="flex-1 min-w-[260px] border border-[#E4E9EC] rounded-xl p-5">
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
          {passwordSaved && <div className="text-[11px] text-[#1F7A4D] mb-2.5">✓ Password updated</div>}
          <button
            onClick={submitPasswordChange}
            className="w-full bg-primary text-white text-center py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer"
          >
            Update Password
          </button>
        </div>
      </div>

      <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Documents</div>
      <div className="bg-white border border-[#E4E9EC] rounded-[10px] px-4 mb-5 max-w-[720px]">
        {COURIER_DOCUMENTS.map((d) => (
          <DocumentRow key={d.field} label={d.label} value={courier[d.field] ?? ""} onUpload={(v) => updateDocument(d.field, v)} />
        ))}
      </div>

      <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Delivered Orders</div>
      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden mb-5">
        <div className="grid grid-cols-3 px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
          <div>Order</div>
          <div>Delivered On</div>
          <div>Amount</div>
        </div>
        {delivered.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">No delivered orders yet</div>
        ) : (
          delivered.map((d) => (
            <div key={d.id} className="grid grid-cols-3 px-4 py-3 text-xs items-center border-b border-[#F0F2F4] last:border-0">
              <div className="font-semibold text-[#1A2027]">{d.id}</div>
              <div className="text-[#5B6773]">{fmtDate(d.deliveredAt)}</div>
              <div className="font-semibold text-[#1F7A4D]">{fmt(d.amount)}</div>
            </div>
          ))
        )}
      </div>

      <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Activity ({filteredActivity.length})</div>
      <div className="flex flex-col sm:flex-row gap-2 mb-2.5">
        <input
          value={activityQuery}
          onChange={(e) => setActivityQuery(e.target.value)}
          placeholder="Search activity..."
          className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-[#E4E9EC] text-xs box-border"
        />
        <input
          type="date"
          value={activityFrom}
          onChange={(e) => setActivityFrom(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[#E4E9EC] text-xs box-border"
        />
        <input
          type="date"
          value={activityTo}
          onChange={(e) => setActivityTo(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[#E4E9EC] text-xs box-border"
        />
        {activityFiltersActive && (
          <button onClick={clearActivityFilters} className="text-xs font-semibold text-primary cursor-pointer shrink-0 px-1">
            Clear
          </button>
        )}
      </div>
      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
        {filteredActivity.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">
            {activity.length === 0 ? "No activity yet" : "No activity matches your filters."}
          </div>
        ) : (
          filteredActivity.map((a) => (
            <div key={a.key} className="px-4 py-3 border-b border-[#F0F2F4] last:border-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span
                  className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0"
                  style={{ background: `${ACTIVITY_CATEGORY_COLORS[a.category]}1A`, color: ACTIVITY_CATEGORY_COLORS[a.category] }}
                >
                  {a.category}
                </span>
                <div className="text-xs font-semibold text-[#3A4652]">{a.text}</div>
              </div>
              <div className="text-[10px] text-[#8A96A3] mt-0.5">{fmtDateTime(a.time)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex-1 min-w-[160px] border border-[#E4E9EC] rounded-xl p-4">
      <div className="text-[11px] text-[#8A96A3] mb-1.5">{label}</div>
      <div className="font-heading font-bold text-lg" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[#8A96A3] mb-0.5">{label}</div>
      <div className="font-semibold text-[#1A2027]">{value}</div>
    </div>
  );
}

function EditField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="mb-3">
      <div className="text-xs font-semibold text-[#3A4652] mb-1.5">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] box-border"
      />
    </div>
  );
}

function PricingField({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[#F7F9FA] rounded-lg px-3 py-2">
      <div className="text-[10px] text-[#8A96A3] mb-0.5">{label}</div>
      <div className="text-[13px] font-bold text-[#1A2027]">Rs. {value.toLocaleString("en-IN")}</div>
    </div>
  );
}

function DocumentRow({ label, value, onUpload }: { label: string; value: string; onUpload: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isLegacyPlaceholder = value.startsWith("DOC:");

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    if (isAllowedDocumentFile(file) && !isAllowedImageFile(file)) {
      setBusy(true);
      try {
        onUpload(await readDocumentFile(file));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not process that file — try a different one.");
      } finally {
        setBusy(false);
      }
      return;
    }
    if (!isAllowedImageFile(file)) {
      setError("Please choose a PNG or JPG photo, a PDF, or a Word document.");
      return;
    }
    setBusy(true);
    try {
      onUpload(await resizeImageFile(file, 1000, 1400));
    } catch {
      setError("Could not process that file — try a different one.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="py-2.5 border-b border-[#F0F2F4] last:border-0 text-xs">
      <div className="flex items-center justify-between gap-2.5 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span
            className="w-[16px] h-[16px] rounded-[4px] shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: value ? "#1F7A4D" : "#fff", border: `1.5px solid ${value ? "#1F7A4D" : "#C7CDD3"}`, color: "#fff" }}
          >
            {value && "✓"}
          </span>
          <div className="text-[#3A4652]">{label}</div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {!value ? (
            <span className="text-[11px] text-[#8A96A3]">Not uploaded</span>
          ) : isLegacyPlaceholder ? (
            <span className="text-[11px] text-[#8A96A3]">{value.slice(4)} (not downloadable)</span>
          ) : (
            <>
              <a href={value} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-primary cursor-pointer">
                Preview
              </a>
              <a href={value} download={label.replace(/\s+/g, "_")} className="text-[11px] font-semibold text-primary cursor-pointer">
                Download
              </a>
            </>
          )}
          <input ref={inputRef} type="file" accept={DOCUMENT_UPLOAD_ACCEPT} className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="text-[11px] font-semibold text-primary cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {busy ? "Uploading…" : value ? "Replace" : "Upload"}
          </button>
        </div>
      </div>
      {error && <div className="text-[11px] text-[#D64545] mt-1">{error}</div>}
    </div>
  );
}
