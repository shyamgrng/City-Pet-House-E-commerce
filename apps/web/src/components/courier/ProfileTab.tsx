"use client";

import { useState } from "react";
import PhoneInput from "@/components/PhoneInput";
import { useCourierAuth } from "@/context/CourierAuthContext";
import { isValidNepalPhone, phoneDigits } from "@/lib/phone";

export default function ProfileTab() {
  const { courier, updateProfile, changePassword } = useCourierAuth();

  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState(courier?.phone ?? "");
  const [altPhone, setAltPhone] = useState(courier?.altPhone ?? "");
  const [address, setAddress] = useState(courier?.address ?? "");
  const [profileSaved, setProfileSaved] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  if (!courier) return null;

  const startEdit = () => {
    setPhone(courier.phone);
    setAltPhone(courier.altPhone);
    setAddress(courier.address);
    setEditing(true);
  };

  const canSaveProfile = isValidNepalPhone(phone) && (phoneDigits(altPhone).length === 0 || isValidNepalPhone(altPhone));

  const saveProfile = () => {
    if (!canSaveProfile) return;
    updateProfile({ phone, altPhone, address });
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

        <ProfileField label="Company Name" value={courier.companyName} />
        <ProfileField label="Courier ID" value={courier.courierId} />
        <ProfileField label="Email" value={courier.email} />

        {!editing ? (
          <>
            <ProfileField label="Phone" value={courier.phone} />
            <ProfileField label="Alternate Phone" value={courier.altPhone} />
            <ProfileField label="Address" value={courier.address} last />
          </>
        ) : (
          <div className="mt-2.5">
            <div className="text-xs text-[#8A96A3] mb-0.5">Phone</div>
            <PhoneInput value={phone} onChange={setPhone} className="mb-2.5" />
            <div className="text-xs text-[#8A96A3] mb-0.5">Alternate Phone</div>
            <PhoneInput value={altPhone} onChange={setAltPhone} className="mb-2.5" />
            <div className="text-xs text-[#8A96A3] mb-0.5">Address</div>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
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

function PricingField({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[#F7F9FA] rounded-lg px-3 py-2">
      <div className="text-[10px] text-[#8A96A3] mb-0.5">{label}</div>
      <div className="text-[13px] font-bold text-[#1A2027]">Rs. {value.toLocaleString("en-IN")}</div>
    </div>
  );
}
