"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import EmailInput from "@/components/EmailInput";
import PhoneInput from "@/components/PhoneInput";
import { useDoctorRegistration } from "@/context/DoctorRegistrationContext";
import { isValidEmail } from "@/lib/email-format";
import { IMAGE_ACCEPT, isAllowedImageFile, resizeImageFile } from "@/lib/image-upload";
import { isValidNepalPhone } from "@/lib/phone";

const STORAGE_FULL_MESSAGE =
  "Couldn't save — your browser's storage is full. Delete an old photo or video somewhere on the site to free up space, then try again.";

const DOC_ACCEPT = `${IMAGE_ACCEPT},.pdf,application/pdf`;

export default function DoctorRegisterPage() {
  const { submitRegistration } = useDoctorRegistration();
  const [submitted, setSubmitted] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [qualification, setQualification] = useState("");
  const [nvcNumber, setNvcNumber] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyNumber, setEmergencyNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [cvFileName, setCvFileName] = useState("");
  const [degreeCertificate, setDegreeCertificate] = useState("");
  const [nvcLicense, setNvcLicense] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const setFieldError = (key: string, msg: string) => setFieldErrors((s) => ({ ...s, [key]: msg }));

  // Accepts either a photo of the document or a PDF scan -- both are common ways people have
  // their certificate/license/ID saved, so we shouldn't force one over the other.
  const handleDoc = async (file: File | undefined, key: string, setValue: (v: string) => void, maxW: number, maxH: number) => {
    if (!file) return;
    setFieldError(key, "");
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (isPdf) {
      setValue(`PDF:${file.name}`);
      return;
    }
    if (!isAllowedImageFile(file)) {
      setFieldError(key, "Please choose an image (JPEG, PNG, HEIC, WEBP...) or a PDF.");
      return;
    }
    try {
      const dataUrl = await resizeImageFile(file, maxW, maxH);
      setValue(dataUrl);
    } catch {
      setFieldError(key, "Could not process that file — try a different one.");
    }
  };

  const handlePhoto = async (file: File | undefined, key: string, setValue: (v: string) => void, maxW: number, maxH: number) => {
    if (!file) return;
    setFieldError(key, "");
    if (!isAllowedImageFile(file)) {
      setFieldError(key, "Please choose an image file (JPEG, PNG, HEIC, WEBP...).");
      return;
    }
    try {
      const dataUrl = await resizeImageFile(file, maxW, maxH);
      setValue(dataUrl);
    } catch {
      setFieldError(key, "Could not process that image — try a different file.");
    }
  };

  const submit = () => {
    const missing = [
      !fullName.trim() && "Full Name",
      !email.trim() && "Email",
      !phone.trim() && "Phone",
      !qualification.trim() && "Qualification",
      !nvcNumber.trim() && "NVC Number",
      !address.trim() && "Address",
      !emergencyNumber.trim() && "Emergency Number",
      !bankName.trim() && "Bank Name",
      !accountHolderName.trim() && "Account Holder Name",
      !accountNumber.trim() && "Account Number",
      !profilePhoto && "Profile Photo",
      !degreeCertificate && "Primary Degree Certificate",
      !nvcLicense && "NVC License",
      !nationalId && "National Identity Card",
    ].filter((v): v is string => Boolean(v));
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(", ")}.`);
      return;
    }
    if (!isValidEmail(email)) {
      setError("Enter a valid email like abc@abc.com.");
      return;
    }
    if (!isValidNepalPhone(phone)) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }
    if (!isValidNepalPhone(emergencyNumber)) {
      setError("Enter a valid 10-digit emergency number.");
      return;
    }
    const ok = submitRegistration({
      fullName,
      email,
      phone,
      qualification,
      nvcNumber,
      address,
      emergencyNumber,
      bankName,
      accountHolderName,
      accountNumber,
      profilePhoto,
      cvFileName,
      degreeCertificate,
      nvcLicense,
      nationalId,
    });
    if (!ok) {
      setError(STORAGE_FULL_MESSAGE);
      return;
    }
    setError("");
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FA]">
        <div className="w-[340px] bg-white border border-[#E4E9EC] rounded-2xl p-[30px] text-center">
          <div className="text-2xl mb-2">✓</div>
          <div className="font-heading font-bold text-base text-[#1A2027] mb-2">Application Submitted</div>
          <div className="text-xs text-[#5B6773] leading-relaxed mb-5">
            Thanks, {fullName}! Our admin team will review your details and documents. You&apos;ll get an email with your Doctor ID and password
            once you&apos;re verified.
          </div>
          <Link href="/doctor/login" className="block w-full bg-primary text-white text-center py-2.5 rounded-lg text-[13px] font-bold">
            Back to Doctor Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FA] py-10 px-4">
      <div className="w-[380px] bg-white border border-[#E4E9EC] rounded-2xl p-[30px]">
        <Link href="/doctor/login" className="text-[11px] text-primary font-semibold mb-3 inline-block">
          ← Back to Doctor Sign In
        </Link>
        <div className="font-heading font-bold text-sm mb-1 flex items-center gap-2 text-[#1A2027]">
          <Image src="/assets/cph-logo.jpeg" alt="" width={24} height={24} className="rounded-md object-cover" />
          Register as a Doctor
        </div>
        <div className="text-xs text-[#8A96A3] mb-5">Submit your details and documents — admin reviews and verifies before your account goes active.</div>

        <RegField label="Full Name" required value={fullName} onChange={setFullName} placeholder="Your full name" />

        <div className="text-[11px] font-semibold text-[#3A4652] mb-1.5">
          Email <span className="text-[#D64545]">*</span>
        </div>
        <EmailInput value={email} onChange={setEmail} className="mb-3" />

        <div className="text-[11px] font-semibold text-[#3A4652] mb-1.5">
          Phone <span className="text-[#D64545]">*</span>
        </div>
        <PhoneInput value={phone} onChange={setPhone} className="mb-3" />

        <RegField label="Qualification" required value={qualification} onChange={setQualification} placeholder="e.g. BVSc & AH, Tribhuvan University" />
        <RegField label="NVC Number" required value={nvcNumber} onChange={setNvcNumber} placeholder="e.g. NVC-1042" />
        <RegField label="Address" required value={address} onChange={setAddress} placeholder="e.g. Baneshwor, Kathmandu" />

        <div className="text-[11px] font-semibold text-[#3A4652] mb-1.5">
          Emergency Number <span className="text-[#D64545]">*</span>
        </div>
        <PhoneInput value={emergencyNumber} onChange={setEmergencyNumber} className="mb-3" />

        <RegField label="Bank Name" required value={bankName} onChange={setBankName} placeholder="e.g. Nabil Bank" />
        <RegField label="Account Holder Name" required value={accountHolderName} onChange={setAccountHolderName} placeholder="As per bank records" />
        <RegField label="Account Number" required value={accountNumber} onChange={setAccountNumber} placeholder="e.g. 01234567890" mb="mb-4" />

        <PhotoDrop
          label="Profile Photo"
          required
          value={profilePhoto}
          error={fieldErrors.profilePhoto}
          onFile={(f) => handlePhoto(f, "profilePhoto", setProfilePhoto, 500, 500)}
        />
        <FileDrop label="Upload CV (PDF)" fileName={cvFileName} accept=".pdf,application/pdf" onFile={(f) => f && setCvFileName(f.name)} />
        <DocDrop
          label="Primary Degree Certificate"
          dropLabel="Certificate"
          required
          value={degreeCertificate}
          error={fieldErrors.degreeCertificate}
          onFile={(f) => handleDoc(f, "degreeCertificate", setDegreeCertificate, 1000, 1400)}
        />
        <DocDrop
          label="NVC License"
          dropLabel="License"
          required
          value={nvcLicense}
          error={fieldErrors.nvcLicense}
          onFile={(f) => handleDoc(f, "nvcLicense", setNvcLicense, 1000, 1400)}
        />
        <DocDrop
          label="National Identity Card"
          dropLabel="National ID"
          required
          value={nationalId}
          error={fieldErrors.nationalId}
          onFile={(f) => handleDoc(f, "nationalId", setNationalId, 1000, 1400)}
          mb="mb-1"
        />

        {error && <div className="text-xs text-[#D64545] mt-3 mb-1">{error}</div>}
        <button onClick={submit} className="w-full bg-primary text-white text-center py-2.5 rounded-lg text-[13px] font-bold cursor-pointer mt-4">
          Submit Application
        </button>
      </div>
    </div>
  );
}

function RegField({
  label,
  required,
  value,
  onChange,
  placeholder,
  mb = "mb-3",
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mb?: string;
}) {
  return (
    <div>
      <div className="text-[11px] font-semibold text-[#3A4652] mb-1.5">
        {label} {required && <span className="text-[#D64545]">*</span>}
      </div>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] box-border ${mb}`}
      />
    </div>
  );
}

function PhotoDrop({
  label,
  dropLabel = "Photo",
  required,
  value,
  error,
  onFile,
  mb = "mb-3",
}: {
  label: string;
  dropLabel?: string;
  required?: boolean;
  value: string;
  error?: string;
  onFile: (file: File | undefined) => void;
  mb?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className={mb}>
      <div className="text-[11px] font-semibold text-[#3A4652] mb-1.5">
        {label} {required && <span className="text-[#D64545]">*</span>}
      </div>
      <input ref={inputRef} type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      {value ? (
        <div onClick={() => inputRef.current?.click()} className="relative cursor-pointer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} className="w-full h-[90px] object-cover rounded-lg border border-[#E4E9EC]" />
          <div className="absolute bottom-1 right-1 bg-white/90 text-[10px] font-semibold text-primary px-1.5 py-0.5 rounded">Replace</div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="w-full h-[90px] rounded-lg border border-dashed border-[#C7CDD3] bg-[#F7F9FA] flex flex-col items-center justify-center cursor-pointer"
        >
          <div className="text-[11px] font-semibold text-[#5B6773]">{dropLabel}</div>
          <div className="text-[10px] text-primary underline">or browse files</div>
        </div>
      )}
      {error && <div className="text-[11px] text-[#D64545] mt-1">{error}</div>}
    </div>
  );
}

/** Same as PhotoDrop, but also accepts a PDF scan -- a photo of a document and a PDF scan of it
 * are equally common ways people have their certificate/license/ID saved. A PDF is stored as
 * just its filename (no reliable in-browser PDF thumbnail), an image is resized and previewed. */
function DocDrop({
  label,
  dropLabel = "Photo",
  required,
  value,
  error,
  onFile,
  mb = "mb-3",
}: {
  label: string;
  dropLabel?: string;
  required?: boolean;
  value: string;
  error?: string;
  onFile: (file: File | undefined) => void;
  mb?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isPdf = value.startsWith("PDF:");
  return (
    <div className={mb}>
      <div className="text-[11px] font-semibold text-[#3A4652] mb-1.5">
        {label} {required && <span className="text-[#D64545]">*</span>}
      </div>
      <input ref={inputRef} type="file" accept={DOC_ACCEPT} className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      {value && !isPdf ? (
        <div onClick={() => inputRef.current?.click()} className="relative cursor-pointer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} className="w-full h-[90px] object-cover rounded-lg border border-[#E4E9EC]" />
          <div className="absolute bottom-1 right-1 bg-white/90 text-[10px] font-semibold text-primary px-1.5 py-0.5 rounded">Replace</div>
        </div>
      ) : value && isPdf ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="w-full h-[90px] rounded-lg border border-[#E4E9EC] bg-[#F7F9FA] flex flex-col items-center justify-center cursor-pointer px-2 text-center"
        >
          <div className="text-[11px] font-semibold text-[#1A2027] truncate max-w-full">{value.slice(4)}</div>
          <div className="text-[10px] text-primary underline mt-1">replace</div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="w-full h-[90px] rounded-lg border border-dashed border-[#C7CDD3] bg-[#F7F9FA] flex flex-col items-center justify-center cursor-pointer"
        >
          <div className="text-[11px] font-semibold text-[#5B6773]">{dropLabel}</div>
          <div className="text-[10px] text-primary underline">photo or PDF — browse files</div>
        </div>
      )}
      {error && <div className="text-[11px] text-[#D64545] mt-1">{error}</div>}
    </div>
  );
}

function FileDrop({
  label,
  fileName,
  accept,
  onFile,
  mb = "mb-3",
}: {
  label: string;
  fileName: string;
  accept: string;
  onFile: (file: File | undefined) => void;
  mb?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className={mb}>
      <div className="text-[11px] font-semibold text-[#3A4652] mb-1.5">{label}</div>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      <div
        onClick={() => inputRef.current?.click()}
        className="w-full h-[90px] rounded-lg border border-dashed border-[#C7CDD3] bg-[#F7F9FA] flex flex-col items-center justify-center cursor-pointer px-2 text-center"
      >
        <div className="text-[11px] font-semibold text-[#5B6773] truncate max-w-full">{fileName || label}</div>
        <div className="text-[10px] text-primary underline">or browse files</div>
      </div>
    </div>
  );
}
