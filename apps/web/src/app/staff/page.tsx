"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DocDrop, PhotoDrop, RegField } from "@/components/registration/RegistrationFields";
import SignaturePad from "@/components/SignaturePad";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useStaffAuth } from "@/context/StaffAuthContext";
import { findAcknowledgment, type StaffAccount } from "@/lib/staff-auth-types";
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
  const { staff, ready, signOut, saveError } = useStaffAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !staff) router.replace("/staff/login");
  }, [ready, staff, router]);

  if (!ready || !staff) return null;

  return <StaffPortalContent staff={staff} signOut={signOut} saveError={saveError} />;
}

function StaffPortalContent({ staff, signOut, saveError }: { staff: StaffAccount; signOut: () => void; saveError: string | null }) {
  const { updateProfile, changePassword, uploadPhoto, uploadDocument, submitDocuments, acknowledgeDocuments } = useStaffAuth();
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
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [signatureUrl, setSignatureUrl] = useState("");
  const [signError, setSignError] = useState("");
  const [previewDoc, setPreviewDoc] = useState<{ label: string; fileUrl: string } | null>(null);

  const allRequiredUploaded = STAFF_DOCUMENTS.filter((d) => d.required).every((d) => staff[d.field]);
  const unsignedDocs = staff.issuedDocuments.filter((d) => !findAcknowledgment(staff, d.id));
  const allViewed = unsignedDocs.every((d) => viewedIds.has(d.id));
  const allChecked = unsignedDocs.every((d) => checkedIds.has(d.id));
  const canSign = unsignedDocs.length > 0 && allViewed && allChecked && Boolean(signatureUrl);
  const today = new Date().toLocaleDateString();

  const saveProfile = () => {
    if (phone && !isValidNepalPhone(phone)) return;
    updateProfile({ phone, address, bankName, bankAccountHolder, bankAccountNumber });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSubmitDocuments = () => {
    submitDocuments();
    setJustSubmitted(true);
    setTimeout(() => setJustSubmitted(false), 2500);
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

  const markViewed = (docId: string) => {
    setViewedIds((s) => new Set(s).add(docId));
  };

  const toggleChecked = (docId: string) => {
    setCheckedIds((s) => {
      const next = new Set(s);
      if (next.has(docId)) next.delete(docId);
      else next.add(docId);
      return next;
    });
  };

  const confirmSign = () => {
    setSignError("");
    if (!canSign) return;
    const ok = acknowledgeDocuments(
      unsignedDocs.map((d) => d.id),
      signatureUrl
    );
    if (!ok) {
      setSignError("Couldn't save your signature — check the storage warning above and try again.");
      return;
    }
    setCheckedIds(new Set());
    setSignatureUrl("");
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

        {saveError && (
          <div className="px-4 py-3 rounded-[10px] mb-5 bg-[#FDECEC] border border-[#F3C6C6] text-[#8A2A2A] text-[11px]">{saveError}</div>
        )}

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

          <button
            onClick={handleSubmitDocuments}
            disabled={!allRequiredUploaded}
            className="w-full bg-primary text-white text-center py-2.5 rounded-lg text-[13px] font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {justSubmitted ? "Submitted ✓" : "Submit Documents"}
          </button>
          {!allRequiredUploaded && (
            <div className="text-[11px] text-[#8A96A3] mt-2">Upload every required document above before submitting.</div>
          )}
          {staff.documentsSubmittedAt && !justSubmitted && (
            <div className="text-[11px] text-[#1F7A4D] font-semibold mt-2">
              ✓ Submitted {new Date(staff.documentsSubmittedAt).toLocaleDateString()} — visible to your admin now.
            </div>
          )}
        </div>

        {staff.issuedDocuments.length > 0 && (
          <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-5 mb-5">
            <div className="text-[13px] font-bold text-[#1A2027] mb-1">Letters &amp; Forms</div>
            <div className="text-xs text-[#8A96A3] mb-3.5">
              Sent to you by your admin. Open each one, tick it off below, then sign once at the bottom to confirm you&apos;ve read all of them.
            </div>

            {staff.issuedDocuments.map((doc) => {
              const ack = findAcknowledgment(staff, doc.id);
              return (
                <div key={doc.id} className="flex items-center justify-between gap-3 py-2.5 border-b border-[#F0F2F4] last:border-0 text-xs">
                  <label className="flex items-center gap-2.5 min-w-0">
                    {ack ? (
                      <span
                        className="w-[16px] h-[16px] rounded-[4px] shrink-0 flex items-center justify-center text-[10px] font-bold"
                        style={{ background: "#1F7A4D", border: "1.5px solid #1F7A4D", color: "#fff" }}
                      >
                        ✓
                      </span>
                    ) : (
                      <input
                        type="checkbox"
                        checked={checkedIds.has(doc.id)}
                        disabled={!viewedIds.has(doc.id)}
                        onChange={() => toggleChecked(doc.id)}
                        className="shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="text-[#3A4652] font-semibold truncate">{doc.label}</div>
                      {ack && (
                        <div className="text-[10px] text-[#1F7A4D] font-semibold mt-0.5">
                          Signed {new Date(ack.agreedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </label>
                  <button
                    onClick={() => {
                      markViewed(doc.id);
                      setPreviewDoc({ label: doc.label, fileUrl: doc.fileUrl });
                    }}
                    className="text-[11px] font-semibold text-primary cursor-pointer shrink-0"
                  >
                    View
                  </button>
                </div>
              );
            })}

            {unsignedDocs.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#F0F2F4]">
                <label className="flex items-start gap-2.5 mb-3.5 cursor-pointer">
                  <input type="checkbox" checked={allChecked} readOnly disabled className="mt-0.5 shrink-0" />
                  <span className="text-xs text-[#3A4652]">
                    I, {staff.name}, confirm I have read and agree to {unsignedDocs.length === 1 ? "the document" : "all documents"} above. Date:{" "}
                    <strong>{today}</strong>
                  </span>
                </label>
                {!allViewed && <div className="text-[11px] text-[#8A96A3] mb-3">Open View on every item above first.</div>}
                {allViewed && !allChecked && <div className="text-[11px] text-[#8A96A3] mb-3">Tick every item above to continue.</div>}

                <div className="text-[11px] font-semibold text-[#3A4652] mb-1.5">Signature</div>
                <SignaturePad onChange={setSignatureUrl} />

                {signError && <div className="text-xs text-[#D64545] mt-2">{signError}</div>}

                <button
                  onClick={confirmSign}
                  disabled={!canSign}
                  className="w-full bg-primary text-white text-center py-2.5 rounded-lg text-[13px] font-bold cursor-pointer mt-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Confirm &amp; Sign
                </button>
              </div>
            )}
          </div>
        )}

        <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-5 mb-5">
          <div className="text-[13px] font-bold text-[#1A2027] mb-3.5">Change Password</div>
          <RegField label="New Password" value={newPassword} onChange={setNewPassword} placeholder="At least 6 characters" mb="mb-3" />
          <button onClick={savePassword} className="w-full bg-white border border-[#E4E9EC] text-[#1A2027] text-center py-2.5 rounded-lg text-[13px] font-bold cursor-pointer">
            {pwSaved ? "Password Updated ✓" : "Update Password"}
          </button>
        </div>
      </div>

      {previewDoc && (
        <div onClick={() => setPreviewDoc(null)} className="fixed inset-0 bg-black/60 flex items-center justify-center z-[80] p-4">
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl w-[560px] max-w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E9EC] shrink-0">
              <div className="text-[15px] font-bold text-[#1A2027]">{previewDoc.label}</div>
              <div onClick={() => setPreviewDoc(null)} className="text-base text-[#8A96A3] cursor-pointer">
                ✕
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-[#F7F9FA]">
              {previewDoc.fileUrl.startsWith("data:image/") ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={previewDoc.fileUrl} alt={previewDoc.label} className="w-full rounded-lg border border-[#E4E9EC] bg-white" />
              ) : previewDoc.fileUrl.startsWith("data:application/pdf") ? (
                <iframe
                  src={previewDoc.fileUrl}
                  title={previewDoc.label}
                  className="w-full border border-[#E4E9EC] rounded-lg bg-white"
                  style={{ height: "75vh" }}
                />
              ) : (
                <div className="bg-white border border-[#E4E9EC] rounded-lg p-5 text-center">
                  <div className="text-xs text-[#5B6773] mb-3">This file can&apos;t be previewed here.</div>
                  <a
                    href={previewDoc.fileUrl}
                    download={previewDoc.label.replace(/\s+/g, "_")}
                    className="inline-block bg-primary text-white px-4 py-2 rounded-lg text-[13px] font-semibold"
                  >
                    Download {previewDoc.label}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
