"use client";

import { useState } from "react";
import { useDoctorAuth } from "@/context/DoctorAuthContext";
import { useVet } from "@/context/VetContext";
import type { Doctor } from "@/lib/vet-types";

export default function ProfileTab({ doctorRecord }: { doctorRecord: Doctor | undefined }) {
  const { doctor, updateAddress, changePassword } = useDoctorAuth();
  const { setDoctorFee } = useVet();

  const [addressEditing, setAddressEditing] = useState(false);
  const [addressDraft, setAddressDraft] = useState(doctor?.address ?? "");

  const [feeDraft, setFeeDraft] = useState(String(doctorRecord?.feeRs ?? 800));
  const [feeSaved, setFeeSaved] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  if (!doctor) return null;

  const verified = doctorRecord?.verified ?? false;

  const startEditAddress = () => {
    setAddressDraft(doctor.address);
    setAddressEditing(true);
  };
  const saveAddress = () => {
    updateAddress(addressDraft);
    setAddressEditing(false);
  };

  const saveFee = () => {
    const fee = Number(feeDraft);
    if (!doctorRecord || Number.isNaN(fee) || fee <= 0) return;
    setDoctorFee(doctorRecord.id, fee);
    setFeeSaved(true);
    setTimeout(() => setFeeSaved(false), 3000);
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
      <div
        className="px-4 py-3 rounded-[10px] mb-4"
        style={{ background: verified ? "#EAF6EE" : "#FFF8EA", border: `1px solid ${verified ? "#CFE9D8" : "#F0DFAE"}` }}
      >
        <div className="text-xs font-bold" style={{ color: verified ? "#1F7A4D" : "#8A6D1F" }}>
          {verified ? "✓ Verified Doctor" : "Verification Pending"}
        </div>
        <div className="text-[11px] text-[#5B6773] mt-0.5">
          {verified
            ? "Your qualification and identity have been verified by City Pet House."
            : "Admin is still reviewing your qualification documents — your contact details are editable until then."}
        </div>
      </div>

      <div className="flex gap-4 flex-wrap items-start">
        <div className="flex-1 min-w-[280px] border border-[#E4E9EC] rounded-xl p-5">
          <div className="text-[13px] font-bold text-[#1A2027] mb-3.5">Personal &amp; Qualification Details</div>
          <div className="w-[100px] h-[130px] mb-3.5 rounded-lg bg-[#EDEFF1] flex items-center justify-center text-[9px] text-[#8A96A3] text-center">
            Passport
            <br />
            Photo
          </div>
          <div className="text-base font-bold text-[#1A2027] mb-3">{doctor.name}</div>

          <ProfileField label="Doctor ID" value={doctor.doctorId} />
          <ProfileField label="Email" value={doctor.email} />
          <ProfileField label="Phone" value={doctor.phone} locked={verified} />
          <ProfileField label="Emergency Number" value={doctor.emergencyPhone} locked={verified} />

          <div className="text-xs text-[#8A96A3] mb-0.5">
            Address {verified && "🔒"}
          </div>
          {verified ? (
            <div className="text-[13px] font-semibold text-[#1A2027] mb-2.5">{doctor.address}</div>
          ) : !addressEditing ? (
            <div className="flex items-center gap-2 mb-2.5">
              <div className="text-[13px] font-semibold text-[#1A2027]">{doctor.address}</div>
              <button onClick={startEditAddress} className="text-[11px] font-semibold text-primary cursor-pointer">
                Edit
              </button>
            </div>
          ) : (
            <div className="mb-2.5">
              <input
                value={addressDraft}
                onChange={(e) => setAddressDraft(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-[#E4E9EC] text-xs mb-2 box-border"
              />
              <div className="flex gap-2">
                <button onClick={saveAddress} className="bg-primary text-white px-3.5 py-1.5 rounded-md text-[11px] font-semibold cursor-pointer">
                  Save
                </button>
                <button
                  onClick={() => setAddressEditing(false)}
                  className="bg-[#F0F2F4] text-[#5B6773] px-3.5 py-1.5 rounded-md text-[11px] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <ProfileField label="Qualification" value={doctorRecord?.qualification ?? ""} />
          <ProfileField label="NVC Number" value={doctorRecord?.nvcNumber ?? ""} last />
        </div>

        <div className="flex-1 min-w-[260px] flex flex-col gap-4">
          <div className="border border-[#E4E9EC] rounded-xl p-5">
            <div className="text-[13px] font-bold text-[#1A2027] mb-3.5">Consultation Fee</div>
            <div className="text-xs font-semibold text-[#3A4652] mb-1.5">Fee per consult (Rs.)</div>
            <input
              value={feeDraft}
              onChange={(e) => setFeeDraft(e.target.value)}
              type="number"
              className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-3 box-border"
            />
            <button onClick={saveFee} className="bg-primary text-white px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer">
              Update Fee
            </button>
            {feeSaved && <div className="text-[11px] text-[#1F7A4D] mt-2">✓ New consults will now use this fee</div>}
          </div>

          <div className="border border-[#E4E9EC] rounded-xl p-5">
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
      </div>
    </div>
  );
}

function ProfileField({ label, value, locked, last }: { label: string; value: string; locked?: boolean; last?: boolean }) {
  return (
    <div className={last ? "" : "mb-2.5"}>
      <div className="text-xs text-[#8A96A3] mb-0.5">
        {label} {locked && "🔒"}
      </div>
      <div className="text-[13px] font-semibold text-[#1A2027]">{value}</div>
    </div>
  );
}
