"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DocDrop, PhotoDrop, RegField } from "@/components/registration/RegistrationFields";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useStaffAuth } from "@/context/StaffAuthContext";
import type { StaffAccount } from "@/lib/staff-auth-types";
import { isAllowedDocumentFile, isAllowedImageFile, readDocumentFile, resizeImageFile } from "@/lib/image-upload";
import { isValidNepalPhone } from "@/lib/phone";
import PhoneInput from "@/components/PhoneInput";

const STAFF_DOCUMENTS: { field: "nationalId" | "degreeCertificate" | "nvcCard" | "drivingLicense"; label: string; required: boolean }[] = [
  { field: "nationalId", label: "National Identity Card", required: true },
  { field: "degreeCertificate", label: "Degree Certificate", required: true },
  { field: "nvcCard", label: "NVC Card", required: true },
  { field: "drivingLicense", label: "Driving License", required: false },
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
  const { updateProfile, changePassword, uploadPhoto, uploadDocument } = useStaffAuth();
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
  const [busyDoc, setBusyDoc] = useState<Record<string, boolean>>({});
  const [docError, setDocError] = useState<Record<string, string>>({});

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

  const handleDoc = async (field: "nationalId" | "degreeCertificate" | "nvcCard" | "drivingLicense", file: File | undefined) => {
    if (!file) return;
    setDocError((s) => ({ ...s, [field]: "" }));
    if (isAllowedDocumentFile(file) && !isAllowedImageFile(file)) {
      setBusyDoc((s) => ({ ...s, [field]: true }));
      try {
        uploadDocument(field, await readDocumentFile(file));
      } catch (err) {
        setDocError((s) => ({ ...s, [field]: err instanceof Error ? err.message : "Could not process that file — try a different one." }));
      } finally {
        setBusyDoc((s) => ({ ...s, [field]: false }));
      }
      return;
    }
    if (!isAllowedImageFile(file)) {
      setDocError((s) => ({ ...s, [field]: "Please choose a PNG or JPG photo, a PDF, or a Word document." }));
      return;
    }
    setBusyDoc((s) => ({ ...s, [field]: true }));
    try {
      uploadDocument(field, await resizeImageFile(file, 1000, 1400));
    } catch {
      setDocError((s) => ({ ...s, [field]: "Could not process that file — try a different one." }));
    } finally {
      setBusyDoc((s) => ({ ...s, [field]: false }));
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

        {staff.mustChangePassword && (
          <div className="px-4 py-3 rounded-[10px] mb-5 bg-[#FDF3E7] border border-[#F0DCB8] text-[#8A5A00]">
            <div className="text-xs font-bold mb-0.5">Please set a new password</div>
            <div className="text-[11px]">Your admin gave you a temporary password — set your own below to keep your account secure.</div>
          </div>
        )}

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
          <div className="text-[13px] font-bold text-[#1A2027] mb-1">Required Documents</div>
          <div className="text-xs text-[#8A96A3] mb-3.5">Upload each document below — your admin can review them from your account.</div>
          {STAFF_DOCUMENTS.map((doc) => (
            <DocDrop
              key={doc.field}
              label={doc.label}
              required={doc.required}
              value={staff[doc.field]}
              error={docError[doc.field]}
              busy={busyDoc[doc.field]}
              onFile={(f) => handleDoc(doc.field, f)}
            />
          ))}
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
