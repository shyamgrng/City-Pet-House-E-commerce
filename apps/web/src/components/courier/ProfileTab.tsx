"use client";

import { useRef, useState } from "react";
import EmailInput from "@/components/EmailInput";
import PhoneInput from "@/components/PhoneInput";
import { useCourierAuth } from "@/context/CourierAuthContext";
import { isValidEmail } from "@/lib/email-format";
import { DOCUMENT_UPLOAD_ACCEPT, isAllowedDocumentFile, isAllowedImageFile, readDocumentFile, resizeImageFile } from "@/lib/image-upload";
import { isValidNepalPhone, phoneDigits } from "@/lib/phone";

const COURIER_DOCUMENTS: { field: "businessDocument" | "ownerIdDocument"; label: string }[] = [
  { field: "businessDocument", label: "Business Registration Document" },
  { field: "ownerIdDocument", label: "Owner's National ID" },
];

export default function ProfileTab() {
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

  return (
    <div>
      {courier.mustChangePassword && (
        <div className="px-4 py-3 rounded-[10px] mb-4 bg-[#FDF3E7] border border-[#F0DCB8] text-[#8A5A00]">
          <div className="text-xs font-bold mb-0.5">Please set a new password</div>
          <div className="text-[11px]">An admin reset your password to a temporary one — set your own below to keep your account secure.</div>
        </div>
      )}
      <div className="flex gap-4 flex-wrap items-start">
        <div className="flex-1 min-w-[280px] border border-[#E4E9EC] rounded-xl p-5">
          <div className="flex justify-between items-center mb-3.5">
            <div className="text-[13px] font-bold text-[#1A2027]">Company Details</div>
            {!editing && (
              <button onClick={startEdit} className="text-[11px] font-semibold text-primary cursor-pointer">
                Edit
              </button>
            )}
          </div>

          {!editing ? (
            <>
              <ProfileField label="Company Name" value={courier.companyName} />
              <ProfileField label="Courier ID" value={courier.courierId} />
              <ProfileField label="Contact Person" value={courier.contactPerson || "—"} />
              <ProfileField label="Email" value={courier.email} />
              <ProfileField label="Phone" value={courier.phone} />
              <ProfileField label="Alternate Phone" value={courier.altPhone || "—"} />
              <ProfileField label="Address" value={courier.address} last />
            </>
          ) : (
            draft && (
              <div className="mt-2.5">
                <EditField label="Company Name" value={draft.companyName} onChange={(v) => setDraft({ ...draft, companyName: v })} />
                <EditField label="Contact Person" value={draft.contactPerson} onChange={(v) => setDraft({ ...draft, contactPerson: v })} />
                <div className="text-xs text-[#8A96A3] mb-0.5">Email</div>
                <EmailInput value={draft.email} onChange={(v) => setDraft({ ...draft, email: v })} />
                <div className="text-xs text-[#8A96A3] mb-0.5">Phone</div>
                <PhoneInput value={draft.phone} onChange={(v) => setDraft({ ...draft, phone: v })} className="mb-2.5" />
                <div className="text-xs text-[#8A96A3] mb-0.5">Alternate Phone</div>
                <PhoneInput value={draft.altPhone} onChange={(v) => setDraft({ ...draft, altPhone: v })} className="mb-2.5" />
                <div className="text-xs text-[#8A96A3] mb-0.5">Address</div>
                <input
                  value={draft.address}
                  onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                  className="w-full px-2.5 py-2 rounded-lg border border-[#E4E9EC] text-xs mb-3 box-border"
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveProfile}
                    disabled={!canSaveProfile}
                    className="bg-primary text-white px-3.5 py-1.5 rounded-md text-[11px] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="bg-[#F0F2F4] text-[#5B6773] px-3.5 py-1.5 rounded-md text-[11px] font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )
          )}
          {profileSaved && <div className="text-[11px] text-[#1F7A4D] mt-2.5">✓ Profile updated</div>}
        </div>

        <div className="flex-1 min-w-[260px] border border-[#E4E9EC] rounded-xl p-5">
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

      <div className="text-[13px] font-bold text-[#1A2027] mt-5 mb-2.5">Documents</div>
      <div className="bg-white border border-[#E4E9EC] rounded-[10px] px-4 max-w-[720px]">
        {COURIER_DOCUMENTS.map((d) => (
          <DocumentRow key={d.field} label={d.label} value={courier[d.field] ?? ""} onUpload={(v) => updateDocument(d.field, v)} />
        ))}
      </div>
    </div>
  );
}

function ProfileField({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={last ? "" : "mb-2.5"}>
      <div className="text-xs text-[#8A96A3] mb-0.5">{label}</div>
      <div className="text-[13px] font-semibold text-[#1A2027]">{value}</div>
    </div>
  );
}

function EditField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="mb-2.5">
      <div className="text-xs text-[#8A96A3] mb-0.5">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2.5 py-2 rounded-lg border border-[#E4E9EC] text-xs box-border"
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
