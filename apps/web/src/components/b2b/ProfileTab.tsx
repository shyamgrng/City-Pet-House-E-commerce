"use client";

import { useState } from "react";
import { useB2BAuth } from "@/context/B2BAuthContext";

export default function ProfileTab() {
  const { supplier, updateProfile, changePassword } = useB2BAuth();

  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState(supplier?.phone ?? "");
  const [altPhone, setAltPhone] = useState(supplier?.altPhone ?? "");
  const [address, setAddress] = useState(supplier?.address ?? "");
  const [profileSaved, setProfileSaved] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  if (!supplier) return null;

  const startEdit = () => {
    setPhone(supplier.phone);
    setAltPhone(supplier.altPhone);
    setAddress(supplier.address);
    setEditing(true);
  };

  const saveProfile = () => {
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

        <ProfileField label="Company Name" value={supplier.companyName} />
        <ProfileField label="Contact Person" value={supplier.contactPerson} />
        <ProfileField label="B2B ID" value={supplier.b2bId} />
        <ProfileField label="Email" value={supplier.email} />

        {!editing ? (
          <>
            <ProfileField label="Phone" value={supplier.phone} />
            <ProfileField label="Alternate Phone" value={supplier.altPhone} />
            <ProfileField label="Address" value={supplier.address} last />
          </>
        ) : (
          <div className="mt-2.5">
            <div className="text-xs text-[#8A96A3] mb-0.5">Phone</div>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-2.5 py-2 rounded-lg border border-[#E4E9EC] text-xs mb-2.5 box-border" />
            <div className="text-xs text-[#8A96A3] mb-0.5">Alternate Phone</div>
            <input
              value={altPhone}
              onChange={(e) => setAltPhone(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg border border-[#E4E9EC] text-xs mb-2.5 box-border"
            />
            <div className="text-xs text-[#8A96A3] mb-0.5">Address</div>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg border border-[#E4E9EC] text-xs mb-3 box-border"
            />
            <div className="flex gap-2">
              <button onClick={saveProfile} className="bg-primary text-white px-3.5 py-1.5 rounded-md text-[11px] font-semibold cursor-pointer">
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
