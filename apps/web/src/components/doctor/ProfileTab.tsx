"use client";

import { useRef, useState } from "react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import PhoneInput from "@/components/PhoneInput";
import PriceInput from "@/components/PriceInput";
import { useDoctorAuth } from "@/context/DoctorAuthContext";
import { useVet } from "@/context/VetContext";
import { DOCUMENT_UPLOAD_ACCEPT, isAllowedDocumentFile, isAllowedImageFile, resizeImageFile } from "@/lib/image-upload";
import { isValidNepalPhone } from "@/lib/phone";
import type { Doctor } from "@/lib/vet-types";

type DocField = "cv" | "degreeCertificate" | "nvcLicense" | "nationalId";
const REQUIRED_DOCUMENTS: { field: DocField; label: string }[] = [
  { field: "cv", label: "CV" },
  { field: "degreeCertificate", label: "Primary Degree Certificate" },
  { field: "nvcLicense", label: "NVC License" },
  { field: "nationalId", label: "National Identity Card" },
];

export default function ProfileTab({ doctorRecord }: { doctorRecord: Doctor | undefined }) {
  const { doctor, updateAddress, updatePhone, updateEmergencyPhone, updatePhoto, updateDocument, changePassword } = useDoctorAuth();
  const { setDoctorFee, setDoctorCommission } = useVet();

  const [addressDraft, setAddressDraft] = useState(doctor?.address ?? "");
  const [addressSaved, setAddressSaved] = useState(false);

  const [phoneDraft, setPhoneDraft] = useState(doctor?.phone ?? "");
  const [phoneSaved, setPhoneSaved] = useState(false);

  const [emergencyDraft, setEmergencyDraft] = useState(doctor?.emergencyPhone ?? "");
  const [emergencySaved, setEmergencySaved] = useState(false);

  const [feeDraft, setFeeDraft] = useState(doctorRecord?.feeRs ?? 800);
  const [feeSaved, setFeeSaved] = useState(false);

  const [commissionType, setCommissionType] = useState<"flat" | "percent">(doctorRecord?.commissionType ?? "percent");
  const [commissionDraft, setCommissionDraft] = useState(doctorRecord?.commissionValue ?? 15);
  const [commissionSaved, setCommissionSaved] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  if (!doctor) return null;

  const verified = doctorRecord?.verified ?? false;

  const saveAddress = () => {
    if (!addressDraft.trim()) return;
    updateAddress(addressDraft);
    setAddressSaved(true);
    setTimeout(() => setAddressSaved(false), 3000);
  };

  const savePhone = () => {
    if (!isValidNepalPhone(phoneDraft)) return;
    updatePhone(phoneDraft);
    setPhoneSaved(true);
    setTimeout(() => setPhoneSaved(false), 3000);
  };

  const saveEmergency = () => {
    if (!isValidNepalPhone(emergencyDraft)) return;
    updateEmergencyPhone(emergencyDraft);
    setEmergencySaved(true);
    setTimeout(() => setEmergencySaved(false), 3000);
  };

  const saveFee = () => {
    if (!doctorRecord || feeDraft <= 0) return;
    setDoctorFee(doctorRecord.id, feeDraft);
    setFeeSaved(true);
    setTimeout(() => setFeeSaved(false), 3000);
  };

  const saveCommission = () => {
    if (!doctorRecord || commissionDraft < 0) return;
    setDoctorCommission(doctorRecord.id, commissionType, commissionDraft);
    setCommissionSaved(true);
    setTimeout(() => setCommissionSaved(false), 3000);
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
      {doctor.mustChangePassword && (
        <div className="px-4 py-3 rounded-[10px] mb-4 bg-[#FDF3E7] border border-[#F0DCB8] text-[#8A5A00]">
          <div className="text-xs font-bold mb-0.5">Please set a new password</div>
          <div className="text-[11px]">An admin reset your password to a temporary one — set your own below to keep your account secure.</div>
        </div>
      )}
      <div
        className="px-4 py-3 rounded-[10px] mb-6"
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

      <div className="bg-white rounded-xl px-2 py-2">
        <FormRow label="Passport Photo">
          <div className="w-[130px]">
            <ImageUploadField value={doctor.photo} onChange={updatePhoto} label="passport photo" height="h-[100px]" maxWidth={400} maxHeight={520} />
          </div>
        </FormRow>

        <FormRow label="Doctor ID">
          <StaticField value={doctor.doctorId} />
        </FormRow>

        <FormRow label="Full Name">
          <StaticField value={doctor.name} />
        </FormRow>

        <Divider />

        <FormRow label="Email address">
          <StaticField value={doctor.email} />
        </FormRow>

        <FormRow label="Phone" required>
          <PhoneInput value={phoneDraft} onChange={setPhoneDraft} className="mb-0 max-w-[300px]" />
          <div className="flex items-center gap-2.5 mt-2">
            <button onClick={savePhone} className="bg-primary text-white px-4 py-2 rounded-md text-xs font-semibold cursor-pointer">
              Save
            </button>
            {phoneSaved && <div className="text-[11px] text-[#1F7A4D]">✓ Phone updated</div>}
          </div>
        </FormRow>

        <FormRow label="Emergency number" required>
          <PhoneInput value={emergencyDraft} onChange={setEmergencyDraft} className="mb-0 max-w-[300px]" />
          <div className="flex items-center gap-2.5 mt-2">
            <button onClick={saveEmergency} className="bg-primary text-white px-4 py-2 rounded-md text-xs font-semibold cursor-pointer">
              Save
            </button>
            {emergencySaved && <div className="text-[11px] text-[#1F7A4D]">✓ Emergency number updated</div>}
          </div>
        </FormRow>

        <FormRow label="Address" required>
          <input
            value={addressDraft}
            onChange={(e) => setAddressDraft(e.target.value)}
            className="w-full max-w-[360px] px-3 py-2.5 rounded-md border border-[#C7CDD3] text-[13px] box-border focus:border-primary focus:outline-none"
          />
          <div className="flex items-center gap-2.5 mt-2">
            <button onClick={saveAddress} className="bg-primary text-white px-4 py-2 rounded-md text-xs font-semibold cursor-pointer">
              Save
            </button>
            {addressSaved && <div className="text-[11px] text-[#1F7A4D]">✓ Address updated</div>}
          </div>
        </FormRow>

        <Divider />

        <FormRow label="Qualification">
          <StaticField value={doctorRecord?.qualification ?? ""} />
        </FormRow>

        <FormRow label="NVC Number">
          <StaticField value={doctorRecord?.nvcNumber ?? ""} />
        </FormRow>

        <Divider />

        <FormRow label="Consultation fee (Rs.)" required>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-[150px]">
              <PriceInput value={feeDraft} onChange={setFeeDraft} />
            </div>
            <button onClick={saveFee} className="bg-primary text-white px-4 py-2.5 rounded-md text-xs font-semibold cursor-pointer">
              Update
            </button>
            {feeSaved && <div className="text-[11px] text-[#1F7A4D]">✓ Updated</div>}
          </div>
        </FormRow>

        <FormRow label="Platform commission" required>
          <div className="flex gap-2 mb-2.5">
            <button
              onClick={() => setCommissionType("percent")}
              className="px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer border-0"
              style={{ background: commissionType === "percent" ? "#1996C8" : "#F0F2F4", color: commissionType === "percent" ? "#fff" : "#5B6773" }}
            >
              Percentage %
            </button>
            <button
              onClick={() => setCommissionType("flat")}
              className="px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer border-0"
              style={{ background: commissionType === "flat" ? "#1996C8" : "#F0F2F4", color: commissionType === "flat" ? "#fff" : "#5B6773" }}
            >
              Flat Rs.
            </button>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-[150px]">
              {commissionType === "flat" ? (
                <PriceInput value={commissionDraft} onChange={setCommissionDraft} />
              ) : (
                <div className="flex gap-2">
                  <input
                    value={commissionDraft > 0 ? String(commissionDraft) : ""}
                    onChange={(e) => setCommissionDraft(Number(e.target.value.replace(/\D/g, "")) || 0)}
                    inputMode="numeric"
                    placeholder="0"
                    className="flex-1 min-w-0 px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] box-border"
                  />
                  <div className="px-3 py-2.5 rounded-lg border border-[#E4E9EC] bg-[#F0F2F4] text-[13px] font-semibold text-[#3A4652] select-none shrink-0">
                    %
                  </div>
                </div>
              )}
            </div>
            <button onClick={saveCommission} className="bg-primary text-white px-4 py-2.5 rounded-md text-xs font-semibold cursor-pointer">
              Update
            </button>
            {commissionSaved && <div className="text-[11px] text-[#1F7A4D]">✓ Updated</div>}
          </div>
          <div className="text-[11px] text-[#8A96A3] mt-1.5">City Pet House&apos;s share of each consult you complete.</div>
        </FormRow>

        <Divider />

        <FormRow label="New password">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full max-w-[300px] px-3 py-2.5 rounded-md border border-[#C7CDD3] text-[13px] box-border focus:border-primary focus:outline-none"
          />
        </FormRow>

        <FormRow label="Reconfirm password">
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full max-w-[300px] px-3 py-2.5 rounded-md border border-[#C7CDD3] text-[13px] box-border focus:border-primary focus:outline-none"
          />
          {mismatch && <div className="text-[11px] text-[#D64545] mt-1.5">Passwords do not match</div>}
        </FormRow>

        <FormRow label="">
          <div className="flex items-center gap-2.5">
            <button onClick={submitPasswordChange} className="bg-primary text-white px-5 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer">
              Update Password
            </button>
            {passwordSaved && <div className="text-[11px] text-[#1F7A4D]">✓ Password updated</div>}
          </div>
        </FormRow>

        <Divider />

        <FormRow label="Registration documents">
          <div className="flex flex-col gap-3.5">
            {REQUIRED_DOCUMENTS.map((d) => (
              <DocumentRow key={d.field} label={d.label} value={doctor[d.field]} onUpload={(v) => updateDocument(d.field, v)} />
            ))}
          </div>
        </FormRow>
      </div>
    </div>
  );
}

function FormRow({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-8 py-3.5 px-4">
      <div className="sm:w-[190px] sm:shrink-0 text-[13px] text-[#3A4652] sm:pt-2.5 empty:hidden sm:empty:block">
        {label}
        {required && <span> *</span>}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-[#E4E9EC] my-2" />;
}

function StaticField({ value }: { value: string }) {
  return <div className="px-3 py-2.5 rounded-md bg-[#F7F9FA] border border-[#E4E9EC] text-[13px] text-[#5B6773] max-w-[360px]">{value}</div>;
}

function DocumentRow({ label, value, onUpload }: { label: string; value: string; onUpload: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const present = Boolean(value);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    if (isAllowedDocumentFile(file) && !isAllowedImageFile(file)) {
      onUpload(`DOC:${file.name}`);
      return;
    }
    if (!isAllowedImageFile(file)) {
      setError("Please choose a PNG or JPG photo, a PDF, or a Word document.");
      return;
    }
    setBusy(true);
    try {
      const dataUrl = await resizeImageFile(file, 1000, 1400);
      onUpload(dataUrl);
    } catch {
      setError("Could not process that file — try a different one.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className="w-[18px] h-[18px] rounded-[4px] shrink-0 flex items-center justify-center text-[11px] font-bold"
          style={{
            background: present ? "#1F7A4D" : "#fff",
            border: `1.5px solid ${present ? "#1F7A4D" : "#C7CDD3"}`,
            color: "#fff",
          }}
        >
          {present && "✓"}
        </span>
        <div className="text-[13px] text-[#3A4652] flex-1 min-w-[120px] sm:w-[190px] sm:flex-none">{label}</div>
        <input ref={inputRef} type="file" accept={DOCUMENT_UPLOAD_ACCEPT} className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
        {busy ? (
          <div className="text-[11px] font-semibold text-[#8A96A3]">Processing…</div>
        ) : present ? (
          <button onClick={() => inputRef.current?.click()} className="text-[11px] font-semibold text-primary cursor-pointer">
            Replace
          </button>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            className="text-[11px] font-semibold text-white bg-primary px-3 py-1.5 rounded-md cursor-pointer"
          >
            Upload
          </button>
        )}
      </div>
      {error && <div className="text-[11px] text-[#D64545] mt-1">{error}</div>}
    </div>
  );
}
