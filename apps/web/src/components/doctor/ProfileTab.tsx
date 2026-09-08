"use client";

import { useRef, useState } from "react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import PriceInput from "@/components/PriceInput";
import { useDoctorAuth } from "@/context/DoctorAuthContext";
import { useVet } from "@/context/VetContext";
import { DOCUMENT_UPLOAD_ACCEPT, isAllowedDocumentFile, isAllowedImageFile, resizeImageFile } from "@/lib/image-upload";
import type { Doctor } from "@/lib/vet-types";

type DocField = "degreeCertificate" | "nvcLicense" | "nationalId";
const REQUIRED_DOCUMENTS: { field: DocField; label: string }[] = [
  { field: "degreeCertificate", label: "Primary Degree Certificate" },
  { field: "nvcLicense", label: "NVC License" },
  { field: "nationalId", label: "National Identity Card" },
];

export default function ProfileTab({ doctorRecord }: { doctorRecord: Doctor | undefined }) {
  const { doctor, updateAddress, updatePhoto, updateDocument, changePassword } = useDoctorAuth();
  const { setDoctorFee } = useVet();

  const [addressEditing, setAddressEditing] = useState(false);
  const [addressDraft, setAddressDraft] = useState(doctor?.address ?? "");

  const [feeDraft, setFeeDraft] = useState(doctorRecord?.feeRs ?? 800);
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
    if (!doctorRecord || feeDraft <= 0) return;
    setDoctorFee(doctorRecord.id, feeDraft);
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

  const documentsComplete = REQUIRED_DOCUMENTS.every((d) => Boolean(doctor[d.field]));

  return (
    <div>
      <div
        className="px-4 py-3 rounded-[10px] mb-5"
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

      <div className="bg-white border border-[#E4E9EC] rounded-xl overflow-hidden">
        <div className="px-6 py-5 flex items-center gap-4 border-b border-[#E4E9EC]">
          <div className="w-[76px] shrink-0">
            <ImageUploadField value={doctor.photo} onChange={updatePhoto} label="passport photo" height="h-[76px]" maxWidth={400} maxHeight={520} />
          </div>
          <div>
            <div className="text-base font-bold text-[#1A2027]">{doctor.name}</div>
            <div className="text-xs text-[#8A96A3] mt-0.5">Doctor ID: {doctor.doctorId}</div>
          </div>
        </div>

        <div className="px-6">
          <ProfileRow label="Email" value={doctor.email} locked />
          <ProfileRow label="Phone" value={doctor.phone} locked />
          <ProfileRow label="Emergency Number" value={doctor.emergencyPhone} locked />

          <ProfileRowShell label="Address">
            {!addressEditing ? (
              <div className="flex items-center gap-3">
                <div className="text-[13px] font-semibold text-[#1A2027]">{doctor.address}</div>
                <button onClick={startEditAddress} className="text-[11px] font-semibold text-primary cursor-pointer">
                  Edit
                </button>
              </div>
            ) : (
              <div>
                <input
                  value={addressDraft}
                  onChange={(e) => setAddressDraft(e.target.value)}
                  className="w-full max-w-[420px] px-2.5 py-2 rounded-lg border border-[#E4E9EC] text-xs mb-2 box-border"
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
          </ProfileRowShell>

          <ProfileRow label="Qualification" value={doctorRecord?.qualification ?? ""} locked />
          <ProfileRow label="NVC Number" value={doctorRecord?.nvcNumber ?? ""} locked last />
        </div>

        <div className="px-6 py-5 border-t border-[#E4E9EC]">
          <div className="text-[13px] font-bold text-[#1A2027] mb-3.5">Consultation Fee</div>
          <div className="flex items-end gap-3 flex-wrap">
            <div className="w-[160px]">
              <div className="text-xs font-semibold text-[#3A4652] mb-1.5">Fee per consult (Rs.)</div>
              <PriceInput value={feeDraft} onChange={setFeeDraft} />
            </div>
            <button onClick={saveFee} className="bg-primary text-white px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer">
              Update Fee
            </button>
            {feeSaved && <div className="text-[11px] text-[#1F7A4D]">✓ New consults will now use this fee</div>}
          </div>
        </div>

        <div className="px-6 py-5 border-t border-[#E4E9EC]">
          <div className="text-[13px] font-bold text-[#1A2027] mb-3.5">Change Password</div>
          <div className="flex gap-4 flex-wrap items-start">
            <div className="w-full max-w-[240px]">
              <div className="text-xs font-semibold text-[#3A4652] mb-1.5">New Password</div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] box-border"
              />
            </div>
            <div className="w-full max-w-[240px]">
              <div className="text-xs font-semibold text-[#3A4652] mb-1.5">Reconfirm Password</div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] box-border"
              />
            </div>
            <button
              onClick={submitPasswordChange}
              className="bg-primary text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer h-[42px]"
            >
              Update Password
            </button>
          </div>
          {mismatch && <div className="text-[11px] text-[#D64545] mt-2">Passwords do not match</div>}
          {passwordSaved && <div className="text-[11px] text-[#1F7A4D] mt-2">✓ Password updated</div>}
        </div>

        <div className="px-6 py-5 border-t border-[#E4E9EC]">
          <div className="flex items-center justify-between mb-3.5">
            <div className="text-[13px] font-bold text-[#1A2027]">Registration Documents</div>
            {documentsComplete ? (
              <div className="text-[11px] font-bold text-[#1F7A4D]">✓ All documents on file</div>
            ) : (
              <div className="text-[11px] font-bold text-[#8A6D1F]">Documents missing</div>
            )}
          </div>
          {REQUIRED_DOCUMENTS.map((d) => (
            <DocumentRow key={d.field} label={d.label} value={doctor[d.field]} onUpload={(v) => updateDocument(d.field, v)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileRow({ label, value, locked, last }: { label: string; value: string; locked?: boolean; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-3.5 ${last ? "" : "border-b border-[#F0F2F4]"}`}>
      <div className="text-xs text-[#8A96A3]">{label}</div>
      <div className="text-[13px] font-semibold text-[#1A2027] flex items-center gap-1.5">
        {value}
        {locked && <span className="text-[11px]">🔒</span>}
      </div>
    </div>
  );
}

function ProfileRowShell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-[#F0F2F4] gap-4">
      <div className="text-xs text-[#8A96A3] shrink-0">{label}</div>
      <div className="text-right">{children}</div>
    </div>
  );
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
    <div className="flex items-center justify-between py-2.5 border-b border-[#F0F2F4] last:border-0 gap-4 flex-wrap">
      <div className="flex items-center gap-2.5">
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
        <div className="text-[13px] font-semibold text-[#1A2027]">{label}</div>
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
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
      {error && <div className="text-[11px] text-[#D64545] w-full text-right">{error}</div>}
    </div>
  );
}
