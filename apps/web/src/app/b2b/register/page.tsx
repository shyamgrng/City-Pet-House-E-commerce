"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import EmailInput from "@/components/EmailInput";
import PhoneInput from "@/components/PhoneInput";
import { DocDrop, RegField } from "@/components/registration/RegistrationFields";
import { useB2BRegistration } from "@/context/B2BRegistrationContext";
import { isValidEmail } from "@/lib/email-format";
import { isAllowedDocumentFile, isAllowedImageFile, resizeImageFile } from "@/lib/image-upload";
import { isValidNepalPhone } from "@/lib/phone";

const STORAGE_FULL_MESSAGE =
  "Couldn't save — your browser's storage is full. Delete an old photo or video somewhere on the site to free up space, then try again.";

export default function B2BRegisterPage() {
  const { submitRegistration } = useB2BRegistration();
  const [submitted, setSubmitted] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [address, setAddress] = useState("");
  const [businessDocument, setBusinessDocument] = useState("");
  const [businessDocumentName, setBusinessDocumentName] = useState("");
  const [ownerIdDocument, setOwnerIdDocument] = useState("");
  const [ownerIdDocumentName, setOwnerIdDocumentName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busyFields, setBusyFields] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");

  const setFieldError = (key: string, msg: string) => setFieldErrors((s) => ({ ...s, [key]: msg }));
  const setFieldBusy = (key: string, busy: boolean) => setBusyFields((s) => ({ ...s, [key]: busy }));

  const handleDoc = async (
    file: File | undefined,
    key: string,
    setValue: (v: string) => void,
    setName: (v: string) => void
  ) => {
    if (!file) return;
    setFieldError(key, "");
    if (isAllowedDocumentFile(file)) {
      setValue(`DOC:${file.name}`);
      setName(file.name);
      return;
    }
    if (!isAllowedImageFile(file)) {
      setFieldError(key, "Please choose a PNG or JPG photo, a PDF, or a Word document.");
      return;
    }
    setFieldBusy(key, true);
    try {
      const dataUrl = await resizeImageFile(file, 1000, 1400);
      setValue(dataUrl);
      setName(file.name);
    } catch {
      setFieldError(key, "Could not process that file — try a different one.");
    } finally {
      setFieldBusy(key, false);
    }
  };

  const submit = () => {
    const missing = [
      !companyName.trim() && "Company Name",
      !contactPerson.trim() && "Contact Person",
      !email.trim() && "Email",
      !phone.trim() && "Phone",
      !address.trim() && "Address",
      !businessDocument && "Business Registration Document",
      !ownerIdDocument && "Owner's National ID",
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
    if (altPhone.trim() && !isValidNepalPhone(altPhone)) {
      setError("Enter a valid 10-digit alternate phone number, or leave it blank.");
      return;
    }
    const ok = submitRegistration({
      companyName,
      contactPerson,
      email,
      phone,
      altPhone,
      address,
      businessDocument,
      ownerIdDocument,
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
            Thanks, {companyName}! Our admin team will review your details and documents. You&apos;ll get an email with your B2B ID and password
            once you&apos;re approved.
          </div>
          <Link href="/b2b/login" className="block w-full bg-primary text-white text-center py-2.5 rounded-lg text-[13px] font-bold">
            Back to B2B Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FA] py-10 px-4">
      <div className="w-[380px] bg-white border border-[#E4E9EC] rounded-2xl p-[30px]">
        <Link href="/b2b/login" className="text-[11px] text-primary font-semibold mb-3 inline-block">
          ← Back to B2B Sign In
        </Link>
        <div className="font-heading font-bold text-sm mb-1 flex items-center gap-2 text-[#1A2027]">
          <Image src="/assets/cph-logo.jpeg" alt="" width={24} height={24} className="rounded-md object-cover" />
          Register as a B2B Supplier
        </div>
        <div className="text-xs text-[#8A96A3] mb-5">Submit your details and documents — admin reviews and verifies before your account goes active.</div>

        <RegField label="Company Name" required value={companyName} onChange={setCompanyName} placeholder="e.g. Himal Pet Supplies Pvt. Ltd." />
        <RegField label="Contact Person" required value={contactPerson} onChange={setContactPerson} placeholder="Full name" />

        <div className="text-[11px] font-semibold text-[#3A4652] mb-1.5">
          Email <span className="text-[#D64545]">*</span>
        </div>
        <EmailInput value={email} onChange={setEmail} className="mb-3" />

        <div className="text-[11px] font-semibold text-[#3A4652] mb-1.5">
          Phone <span className="text-[#D64545]">*</span>
        </div>
        <PhoneInput value={phone} onChange={setPhone} className="mb-3" />

        <div className="text-[11px] font-semibold text-[#3A4652] mb-1.5">Alternate Phone</div>
        <PhoneInput value={altPhone} onChange={setAltPhone} className="mb-3" />

        <RegField label="Address" required value={address} onChange={setAddress} placeholder="e.g. Balaju Industrial Area, Kathmandu" mb="mb-4" />

        <DocDrop
          label="Business Registration Document"
          dropLabel="Business Doc"
          required
          value={businessDocument}
          fileName={businessDocumentName}
          error={fieldErrors.businessDocument}
          busy={busyFields.businessDocument}
          onFile={(f) => handleDoc(f, "businessDocument", setBusinessDocument, setBusinessDocumentName)}
        />
        <DocDrop
          label="Owner's National ID"
          dropLabel="National ID"
          required
          value={ownerIdDocument}
          fileName={ownerIdDocumentName}
          error={fieldErrors.ownerIdDocument}
          busy={busyFields.ownerIdDocument}
          onFile={(f) => handleDoc(f, "ownerIdDocument", setOwnerIdDocument, setOwnerIdDocumentName)}
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
