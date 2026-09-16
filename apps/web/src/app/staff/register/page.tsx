"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import EmailInput from "@/components/EmailInput";
import PhoneInput from "@/components/PhoneInput";
import { DocDrop, RegField } from "@/components/registration/RegistrationFields";
import { useStaffRegistration } from "@/context/StaffRegistrationContext";
import { isValidEmail } from "@/lib/email-format";
import { isAllowedDocumentFile, isAllowedImageFile, readDocumentFile, resizeImageFile } from "@/lib/image-upload";
import { isValidNepalPhone } from "@/lib/phone";

const STORAGE_FULL_MESSAGE =
  "Couldn't save — your browser's storage is full. Delete an old photo or video somewhere on the site to free up space, then try again.";

export default function StaffRegisterPage() {
  const { submitRegistration } = useStaffRegistration();
  const [submitted, setSubmitted] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [nationalIdName, setNationalIdName] = useState("");
  const [degreeCertificate, setDegreeCertificate] = useState("");
  const [degreeCertificateName, setDegreeCertificateName] = useState("");
  const [nvcCard, setNvcCard] = useState("");
  const [nvcCardName, setNvcCardName] = useState("");
  const [drivingLicense, setDrivingLicense] = useState("");
  const [drivingLicenseName, setDrivingLicenseName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busyFields, setBusyFields] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");

  const setFieldError = (key: string, msg: string) => setFieldErrors((s) => ({ ...s, [key]: msg }));
  const setFieldBusy = (key: string, busy: boolean) => setBusyFields((s) => ({ ...s, [key]: busy }));

  const handleDoc = async (file: File | undefined, key: string, setValue: (v: string) => void, setName: (v: string) => void) => {
    if (!file) return;
    setFieldError(key, "");
    if (isAllowedDocumentFile(file) && !isAllowedImageFile(file)) {
      setFieldBusy(key, true);
      try {
        setValue(await readDocumentFile(file));
        setName(file.name);
      } catch (err) {
        setFieldError(key, err instanceof Error ? err.message : "Could not process that file — try a different one.");
      } finally {
        setFieldBusy(key, false);
      }
      return;
    }
    if (!isAllowedImageFile(file)) {
      setFieldError(key, "Please choose a PNG or JPG photo, a PDF, or a Word document.");
      return;
    }
    setFieldBusy(key, true);
    try {
      setValue(await resizeImageFile(file, 1000, 1400));
      setName(file.name);
    } catch {
      setFieldError(key, "Could not process that file — try a different one.");
    } finally {
      setFieldBusy(key, false);
    }
  };

  const submit = () => {
    const missing = [
      !fullName.trim() && "Full Name",
      !email.trim() && "Email",
      !phone.trim() && "Phone",
      !jobTitle.trim() && "Job Title",
      !nationalId && "National Identity Card",
      !degreeCertificate && "Degree Certificate",
      !nvcCard && "NVC Card",
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
    const ok = submitRegistration({ fullName, email, phone, jobTitle, nationalId, degreeCertificate, nvcCard, drivingLicense });
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
            Thanks, {fullName}! Our admin team will review your details and documents. You&apos;ll get an email with your Staff ID and password once
            you&apos;re approved.
          </div>
          <Link href="/staff/login" className="block w-full bg-primary text-white text-center py-2.5 rounded-lg text-[13px] font-bold">
            Back to Staff Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FA] py-10 px-4">
      <div className="w-[380px] bg-white border border-[#E4E9EC] rounded-2xl p-[30px]">
        <Link href="/staff/login" className="text-[11px] text-primary font-semibold mb-3 inline-block">
          ← Back to Staff Sign In
        </Link>
        <div className="font-heading font-bold text-sm mb-1 flex items-center gap-2 text-[#1A2027]">
          <Link href="/" className="shrink-0">
            <Image src="/assets/cph-logo.jpeg" alt="" width={24} height={24} className="rounded-md object-cover" />
          </Link>
          Apply as Staff
        </div>
        <div className="text-xs text-[#8A96A3] mb-5">Submit your details and documents — admin reviews and issues your Staff ID and password once approved.</div>

        <RegField label="Full Name" required value={fullName} onChange={setFullName} placeholder="Your full name" />

        <div className="text-[11px] font-semibold text-[#3A4652] mb-1.5">
          Email <span className="text-[#D64545]">*</span>
        </div>
        <EmailInput value={email} onChange={setEmail} className="mb-3" />

        <div className="text-[11px] font-semibold text-[#3A4652] mb-1.5">
          Phone <span className="text-[#D64545]">*</span>
        </div>
        <PhoneInput value={phone} onChange={setPhone} className="mb-3" />

        <RegField label="Job Title Applied For" required value={jobTitle} onChange={setJobTitle} placeholder="e.g. Store Assistant" mb="mb-4" />

        <DocDrop
          label="National Identity Card"
          dropLabel="National ID"
          required
          value={nationalId}
          fileName={nationalIdName}
          error={fieldErrors.nationalId}
          busy={busyFields.nationalId}
          onFile={(f) => handleDoc(f, "nationalId", setNationalId, setNationalIdName)}
        />
        <DocDrop
          label="Degree Certificate"
          dropLabel="Certificate"
          required
          value={degreeCertificate}
          fileName={degreeCertificateName}
          error={fieldErrors.degreeCertificate}
          busy={busyFields.degreeCertificate}
          onFile={(f) => handleDoc(f, "degreeCertificate", setDegreeCertificate, setDegreeCertificateName)}
        />
        <DocDrop
          label="NVC Card"
          dropLabel="NVC Card"
          required
          value={nvcCard}
          fileName={nvcCardName}
          error={fieldErrors.nvcCard}
          busy={busyFields.nvcCard}
          onFile={(f) => handleDoc(f, "nvcCard", setNvcCard, setNvcCardName)}
        />
        <DocDrop
          label="Driving License"
          dropLabel="License (optional)"
          value={drivingLicense}
          fileName={drivingLicenseName}
          error={fieldErrors.drivingLicense}
          busy={busyFields.drivingLicense}
          onFile={(f) => handleDoc(f, "drivingLicense", setDrivingLicense, setDrivingLicenseName)}
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
