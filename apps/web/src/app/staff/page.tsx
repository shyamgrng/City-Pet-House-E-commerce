"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PhotoDrop, RegField } from "@/components/registration/RegistrationFields";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useStaffAuth } from "@/context/StaffAuthContext";
import type { StaffAccount } from "@/lib/staff-auth-types";
import { isAllowedImageFile, resizeImageFile } from "@/lib/image-upload";
import { isValidNepalPhone } from "@/lib/phone";
import PhoneInput from "@/components/PhoneInput";

const STAFF_DOCUMENTS: { field: "nationalId" | "degreeCertificate" | "nvcCard" | "drivingLicense"; label: string }[] = [
  { field: "nationalId", label: "National Identity Card" },
  { field: "degreeCertificate", label: "Degree Certificate" },
  { field: "nvcCard", label: "NVC Card" },
  { field: "drivingLicense", label: "Driving License" },
];

export default function StaffPortalPage() {
  const { staff, ready, signOut } = useStaffAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !staff) router.replace("/staff/login");
  }, [ready, staff, router]);

  if (!ready || !staff) return null;

  return <StaffPortalContent staff={staff} signOut={signOut} />;
}

function StaffPortalContent({ staff, signOut }: { staff: StaffAccount; signOut: () => void }) {
  const { updateProfile, changePassword, uploadPhoto } = useStaffAuth();
  const { settings } = useSiteSettings();
  const router = useRouter();

  const [phone, setPhone] = useState(staff.phone);
  const [address, setAddress] = useState(staff.address);
  const [bankName, setBankName] = useState(staff.bankName ?? "");
  const [bankAccountHolder, setBankAccountHolder] = useState(staff.bankAccountHolder ?? "");
  const [bankAccountNumber, setBankAccountNumber] = useState(staff.bankAccountNumber ?? "");
  const [saved, setSaved] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [pwSaved, setPwSaved] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState("");

  const saveProfile = () => {
    if (phone && !isValidNepalPhone(phone)) return;
    updateProfile({ phone, address, bankName, bankAccountHolder, bankAccountNumber });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const savePassword = () => {
    if (!newPassword.trim()) return;
    changePassword(newPassword.trim());
    setNewPassword("");
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 2500);
  };

  const handlePhoto = async (file: File | undefined) => {
    if (!file) return;
    setPhotoError("");
    if (!isAllowedImageFile(file)) {
      setPhotoError("Please choose a PNG or JPG image.");
      return;
    }
    setPhotoBusy(true);
    try {
      uploadPhoto(await resizeImageFile(file, 500, 500));
    } catch {
      setPhotoError("Could not process that image — try a different file.");
    } finally {
      setPhotoBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FA]">
      <div className="bg-[#F7F9FA] border-b border-[#E4E9EC]">
        <div className="flex items-center justify-center gap-4 max-w-7xl mx-auto px-4 md:px-8 py-1.5 text-[11px] text-[#5B6773]">
          <div>📞 {settings.phone}</div>
          <div>📍 {settings.address}</div>
          <div>{settings.hours}</div>
        </div>
      </div>

      <div className="bg-white border-b border-[#E4E9EC]">
        <div className="flex items-center justify-between max-w-7xl mx-auto px-4 md:px-8 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/assets/cph-logo.jpeg" alt="" width={34} height={34} className="rounded-md object-contain" />
            <span className="font-heading font-bold text-[15px] text-[#1A2027]">CPH Staff Portal</span>
          </Link>
          <button
            onClick={() => {
              signOut();
              router.push("/staff/login");
            }}
            className="text-[13px] font-semibold text-[#D64545] cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-[560px] mx-auto px-4 md:px-8 py-7">
        <div className="font-heading font-bold text-lg text-[#1A2027] mb-1">Welcome, {staff.name}</div>
        <div className="text-[13px] text-[#8A96A3] mb-5">
          {staff.jobTitle} · Staff ID {staff.staffId}
        </div>

        <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-5 mb-5">
          <div className="text-[13px] font-bold text-[#1A2027] mb-3.5">Your Details</div>

          <PhotoDrop label="Profile Photo" value={staff.photo} error={photoError} busy={photoBusy} onFile={handlePhoto} />

          <div className="mb-3">
            <div className="text-[11px] font-semibold text-[#3A4652] mb-1.5">Full Name</div>
            <div className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] bg-[#F7F9FA] text-[13px] text-[#5B6773] box-border">{staff.name}</div>
            <div className="text-[11px] text-[#8A96A3] mt-1">Ask your admin to change your name or email.</div>
          </div>

          <div className="text-[11px] font-semibold text-[#3A4652] mb-1.5">Phone</div>
          <PhoneInput value={phone} onChange={setPhone} className="mb-3" />

          <RegField label="Address" value={address} onChange={setAddress} placeholder="e.g. Baneshwor, Kathmandu" />

          <div className="text-xs font-semibold text-[#3A4652] mb-2 mt-1">Bank Details (for salary payout)</div>
          <RegField label="Bank Name" value={bankName} onChange={setBankName} placeholder="e.g. Nabil Bank" />
          <RegField label="Account Holder Name" value={bankAccountHolder} onChange={setBankAccountHolder} placeholder="As per bank records" />
          <RegField label="Account Number" value={bankAccountNumber} onChange={setBankAccountNumber} placeholder="e.g. 01234567890" mb="mb-4" />

          <button onClick={saveProfile} className="w-full bg-primary text-white text-center py-2.5 rounded-lg text-[13px] font-bold cursor-pointer">
            {saved ? "Saved ✓" : "Save Details"}
          </button>
        </div>

        <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-5 mb-5">
          <div className="text-[13px] font-bold text-[#1A2027] mb-1">Documents on File</div>
          <div className="text-xs text-[#8A96A3] mb-3.5">Submitted with your application and reviewed by your admin. Contact your admin to replace one.</div>
          {STAFF_DOCUMENTS.map((doc) => {
            const value = staff[doc.field];
            return (
              <div key={doc.field} className="flex items-center justify-between py-2.5 border-b border-[#F0F2F4] last:border-0 text-xs">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-[16px] h-[16px] rounded-[4px] shrink-0 flex items-center justify-center text-[10px] font-bold"
                    style={{ background: value ? "#1F7A4D" : "#fff", border: `1.5px solid ${value ? "#1F7A4D" : "#C7CDD3"}`, color: "#fff" }}
                  >
                    {value && "✓"}
                  </span>
                  <div className="text-[#3A4652]">{doc.label}</div>
                </div>
                {value ? (
                  <a href={value} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-primary cursor-pointer">
                    Preview
                  </a>
                ) : (
                  <span className="text-[11px] text-[#8A96A3]">Not on file</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-5 mb-5">
          <div className="text-[13px] font-bold text-[#1A2027] mb-3.5">Change Password</div>
          <RegField label="New Password" value={newPassword} onChange={setNewPassword} placeholder="At least 6 characters" mb="mb-3" />
          <button onClick={savePassword} className="w-full bg-white border border-[#E4E9EC] text-[#1A2027] text-center py-2.5 rounded-lg text-[13px] font-bold cursor-pointer">
            {pwSaved ? "Password Updated ✓" : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
