"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DocDrop, PhotoDrop, RegField } from "@/components/registration/RegistrationFields";
import SignaturePad from "@/components/SignaturePad";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useStaffAuth } from "@/context/StaffAuthContext";
import type { IssuedDocument, StaffAccount } from "@/lib/staff-auth-types";
import { isAllowedDocumentFile, isAllowedImageFile, readDocumentFile, resizeImageFile } from "@/lib/image-upload";
import { isValidNepalPhone } from "@/lib/phone";
import PhoneInput from "@/components/PhoneInput";

const MIN_REVIEW_SECONDS = 5;

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
  const { updateProfile, changePassword, uploadPhoto, uploadDocument, submitDocuments, acknowledgeDocument } = useStaffAuth();
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
  const [signingDocId, setSigningDocId] = useState<string | null>(null);

  const allRequiredUploaded = STAFF_DOCUMENTS.filter((d) => d.required).every((d) => staff[d.field]);
  const signingDoc = staff.issuedDocuments.find((d) => d.id === signingDocId) ?? null;

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
            <div className="text-xs text-[#8A96A3] mb-3.5">Sent to you by your admin — review and sign each one to confirm you&apos;ve read it.</div>
            {staff.issuedDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between py-2.5 border-b border-[#F0F2F4] last:border-0 text-xs">
                <div>
                  <div className="text-[#3A4652] font-semibold">{doc.label}</div>
                  {doc.acknowledgment && (
                    <div className="text-[10px] text-[#1F7A4D] font-semibold mt-0.5">
                      ✓ Signed {new Date(doc.acknowledgment.agreedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
                {doc.acknowledgment ? (
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-primary cursor-pointer shrink-0">
                    View
                  </a>
                ) : (
                  <button onClick={() => setSigningDocId(doc.id)} className="text-[11px] font-semibold text-primary cursor-pointer shrink-0">
                    Review &amp; Sign
                  </button>
                )}
              </div>
            ))}
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

      {signingDoc && (
        <SignDocumentModal
          doc={signingDoc}
          staffName={staff.name}
          onClose={() => setSigningDocId(null)}
          onSign={(signatureDataUrl) => {
            acknowledgeDocument(signingDoc.id, signatureDataUrl);
            setSigningDocId(null);
          }}
        />
      )}
    </div>
  );
}

/** Gates the checklist/date/signature behind actually engaging with the document: the file has to
 * be embeddable (image or PDF) and scrolled to its end, and a minimum review timer must run out,
 * before the checkbox and signature pad unlock. A Word/other non-embeddable file can't be scroll-
 * tracked in-browser, so that case falls back to the timer alone with a clear "download to review"
 * prompt instead of silently pretending to verify it. */
function SignDocumentModal({
  doc,
  staffName,
  onClose,
  onSign,
}: {
  doc: IssuedDocument;
  staffName: string;
  onClose: () => void;
  onSign: (signatureDataUrl: string) => void;
}) {
  const isImage = doc.fileUrl.startsWith("data:image/");
  const isPdf = doc.fileUrl.startsWith("data:application/pdf");
  const isEmbeddable = isImage || isPdf;

  const [scrolledToEnd, setScrolledToEnd] = useState(!isEmbeddable);
  const [secondsLeft, setSecondsLeft] = useState(MIN_REVIEW_SECONDS);
  const [agreed, setAgreed] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  // A short document (e.g. a single small image) can already fit the viewer with nothing to
  // scroll, so no scroll event will ever fire -- treat "nothing to scroll" as already read.
  const checkFits = () => {
    const el = scrollRef.current;
    if (el && el.scrollHeight <= el.clientHeight + 4) setScrolledToEnd(true);
  };
  useEffect(checkFits, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 16) setScrolledToEnd(true);
  };

  const canSign = scrolledToEnd && secondsLeft <= 0;
  const today = new Date().toLocaleDateString();

  const confirm = () => {
    if (!canSign || !agreed || !signatureUrl) return;
    onSign(signatureUrl);
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/60 flex items-center justify-center z-[80] p-4">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl w-[480px] max-w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E9EC] shrink-0">
          <div className="text-[15px] font-bold text-[#1A2027]">{doc.label}</div>
          <div onClick={onClose} className="text-base text-[#8A96A3] cursor-pointer">
            ✕
          </div>
        </div>

        <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 bg-[#F7F9FA]">
          {isImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={doc.fileUrl} alt={doc.label} onLoad={checkFits} className="w-full rounded-lg border border-[#E4E9EC] bg-white" />
          ) : isPdf ? (
            <iframe src={doc.fileUrl} title={doc.label} className="w-full border border-[#E4E9EC] rounded-lg bg-white" style={{ height: 1200 }} />
          ) : (
            <div className="bg-white border border-[#E4E9EC] rounded-lg p-5 text-center">
              <div className="text-xs text-[#5B6773] mb-3">This file can&apos;t be previewed here — download it to review before signing.</div>
              <a
                href={doc.fileUrl}
                download={doc.label.replace(/\s+/g, "_")}
                className="inline-block bg-primary text-white px-4 py-2 rounded-lg text-[13px] font-semibold"
              >
                Download {doc.label}
              </a>
            </div>
          )}
          {isEmbeddable && <div className="text-center text-[11px] text-[#8A96A3] py-3">— End of document —</div>}
        </div>

        <div className="p-5 border-t border-[#E4E9EC] shrink-0">
          {!canSign ? (
            <div className="text-xs text-[#8A6D1F] bg-[#FDF3E7] border border-[#F0DCB8] rounded-lg px-3.5 py-2.5">
              {!scrolledToEnd
                ? "Please scroll through the document above to review it."
                : `You can sign in ${secondsLeft}s — please take a moment to read the document.`}
            </div>
          ) : (
            <>
              <label className="flex items-start gap-2.5 mb-3.5 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 shrink-0" />
                <span className="text-xs text-[#3A4652]">
                  I, {staffName}, confirm I have read and agree to this document. Date: <strong>{today}</strong>
                </span>
              </label>

              <div className="text-[11px] font-semibold text-[#3A4652] mb-1.5">Signature</div>
              <SignaturePad onChange={setSignatureUrl} />

              <button
                onClick={confirm}
                disabled={!agreed || !signatureUrl}
                className="w-full bg-primary text-white text-center py-2.5 rounded-lg text-[13px] font-bold cursor-pointer mt-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirm &amp; Sign
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
