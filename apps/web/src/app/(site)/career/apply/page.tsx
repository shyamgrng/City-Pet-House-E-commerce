"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import EmailInput from "@/components/EmailInput";
import PhoneInput from "@/components/PhoneInput";
import { useCareer } from "@/context/CareerContext";
import { isValidEmail } from "@/lib/email-format";
import { isValidNepalPhone } from "@/lib/phone";

export default function CareerApplyPage() {
  return (
    <Suspense fallback={null}>
      <CareerApplyForm />
    </Suspense>
  );
}

function CareerApplyForm() {
  const { content, submitApplication } = useCareer();
  const searchParams = useSearchParams();
  const preselected = searchParams.get("role") || content.jobs[0]?.title || "";

  const [role, setRole] = useState(preselected);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [cvName, setCvName] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (!name.trim() || !phone.trim() || !email.trim()) {
      setError("Please fill all required fields (Name, Phone Number & Email Address).");
      return;
    }
    if (!isValidNepalPhone(phone)) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Enter a valid email like abc@abc.com.");
      return;
    }
    submitApplication({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim() || "Not provided",
      appliedFor: role,
      cvName: cvName || "No file attached",
      coverLetter: coverLetter.trim() || "(No cover letter provided)",
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="px-8 py-16 flex justify-center">
        <div className="max-w-[480px] w-full text-center">
          <div className="font-heading font-extrabold text-2xl text-[#1A2027] mb-2">Application Submitted</div>
          <div className="text-sm text-[#5B6773] mb-6">Thanks {name} — our team will review your application and reach out soon.</div>
          <Link href="/career" className="inline-block bg-primary text-white px-6 py-3 rounded-lg text-sm font-semibold">
            Back to Career
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-10 flex justify-center">
      <div className="max-w-[600px] w-full">
        <Link href="/career" className="text-[13px] text-primary font-semibold mb-4 inline-block">
          ← Back to Home
        </Link>
        <div className="font-heading font-extrabold text-[26px] text-[#1A2027] mb-2">Express Your Interest</div>
        <div className="text-sm text-[#5B6773] mb-7">Tell us a bit about yourself and attach your resume — we&apos;ll be in touch.</div>

        <div className="bg-white border border-[#E4E9EC] rounded-2xl p-6 flex flex-col gap-3.5">
          <div>
            <div className="text-[11px] font-bold text-[#8A96A3] mb-1.5">POSITION APPLYING FOR</div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full box-border h-[46px] rounded-lg border border-[#E4E9EC] px-3 text-sm font-sans"
            >
              {content.jobs.map((job) => (
                <option key={job.id} value={job.title}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Applicant Name*"
            className="w-full box-border h-[46px] rounded-lg border border-[#E4E9EC] px-3.5 text-[13px]"
          />
          <PhoneInput value={phone} onChange={setPhone} className="" />
          <EmailInput value={email} onChange={setEmail} placeholder="Email Address*" className="" />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address*"
            className="w-full box-border h-[46px] rounded-lg border border-[#E4E9EC] px-3.5 text-[13px]"
          />

          <div>
            <div className="text-[11px] font-bold text-[#8A96A3] mb-1.5">UPLOAD CV / RESUME</div>
            <label className="flex items-center justify-center gap-2 h-[60px] rounded-lg border-[1.5px] border-dashed border-[#C7CDD3] cursor-pointer text-xs text-[#5B6773]">
              📎 {cvName || "Choose a file…"}
              <input type="file" onChange={(e) => setCvName(e.target.files?.[0]?.name ?? "")} className="hidden" />
            </label>
          </div>

          <div>
            <div className="text-[11px] font-bold text-[#8A96A3] mb-1.5">COVER LETTER</div>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Write a short cover letter..."
              className="w-full box-border h-[130px] rounded-lg border border-[#E4E9EC] p-3.5 text-[13px] resize-y font-sans"
            />
          </div>

          {error && <div className="text-xs text-[#D64545] font-semibold">{error}</div>}

          <button
            onClick={submit}
            className="bg-primary text-white text-center py-3.5 rounded-lg text-[13px] font-bold tracking-[0.5px] cursor-pointer"
          >
            SUBMIT
          </button>
        </div>
      </div>
    </div>
  );
}
