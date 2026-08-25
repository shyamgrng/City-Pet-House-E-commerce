"use client";

import Link from "next/link";
import { useState } from "react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import PhoneInput from "@/components/PhoneInput";
import { useB2BAuth } from "@/context/B2BAuthContext";
import { useDoctorAuth } from "@/context/DoctorAuthContext";
import { microchipAddress, useMicrochip } from "@/context/MicrochipContext";
import { isValidNepalPhone } from "@/lib/phone";
import type { MicrochipRecord } from "@/lib/microchip-types";

type RegisterForm = Omit<MicrochipRecord, "id">;

const EMPTY_REGISTER: RegisterForm = {
  mcNumber: "",
  ownerName: "",
  wardNo: "",
  municipality: "",
  phone: "",
  altPhone: "",
  houseNo: "",
  district: "",
  provinceNo: "",
  zone: "",
  mapLink: "",
  petName: "",
  photo: "",
  sex: "Male",
  age: "",
  color: "",
  breed: "",
  notes: "",
  vetName: "",
  clinic: "City Pet House & Animal Clinic",
  mcDate: "",
};

export default function MicrochippingArchivePage() {
  const { content, lookupRecord, addRecord, ready } = useMicrochip();
  const { doctor, ready: doctorReady } = useDoctorAuth();
  const { supplier, ready: b2bReady } = useB2BAuth();
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<MicrochipRecord | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState<RegisterForm>(EMPTY_REGISTER);
  const [registered, setRegistered] = useState(false);

  if (!ready || !doctorReady || !b2bReady) return null;

  const accessAllowed = !!doctor || !!supplier;

  const submit = () => {
    setResult(lookupRecord(query));
    setSubmitted(true);
  };

  const canRegister =
    registerForm.mcNumber.trim().length > 0 && registerForm.petName.trim().length > 0 && registerForm.ownerName.trim().length > 0 && isValidNepalPhone(registerForm.phone);

  const submitRegister = () => {
    if (!canRegister) return;
    addRecord(registerForm);
    setRegisterForm(EMPTY_REGISTER);
    setRegistered(true);
    setShowRegister(false);
  };

  if (result) {
    const address = microchipAddress(result);
    return (
      <div>
        <div style={{ background: "linear-gradient(135deg, #7A56C8, #4E3A8A)" }} className="p-8 text-center relative">
          <Link href="/" className="absolute top-6 left-8 text-[13px] text-white font-semibold opacity-90">
            ← Back to Home
          </Link>
          <div className="text-xs text-white/85 font-bold tracking-[0.6px]">💠 CITY PET HOUSE · MICROCHIP RECORD</div>
        </div>

        <div className="flex justify-center px-8 pb-12">
          <div className="w-full max-w-[520px] -mt-14">
            <div className="bg-white rounded-2xl p-7 text-center mb-5" style={{ boxShadow: "0 12px 30px rgba(0,0,0,0.1)" }}>
              <div className="w-[100px] h-[100px] -mt-[72px] mb-3 mx-auto rounded-full border-[5px] border-white shadow-[0_6px_14px_rgba(0,0,0,0.14)]">
                <ImagePlaceholder label="🐾" shape="circle" className="w-full h-full" />
              </div>
              <div className="font-heading font-bold text-[22px] text-[#1A2027]">{result.petName}</div>
              <div className="text-[13px] text-[#8A96A3] mt-1">
                {result.breed} · {result.color} · {result.sex}, {result.age}
              </div>
              <div className="inline-block mt-3 bg-[#F3EEFB] rounded-full px-3.5 py-1.5 text-xs text-[#5B3FA0] font-semibold">
                Microchip: {result.mcNumber}
              </div>
            </div>

            <div className="bg-white border border-[#E4E9EC] rounded-2xl p-6 mb-5">
              <div className="text-xs font-bold text-[#7A56C8] tracking-[0.5px] mb-3.5">OWNER CONTACT</div>
              <div className="text-lg font-bold text-[#1A2027] mb-3.5">{result.ownerName}</div>
              <a href={`tel:${result.phone}`} className="flex items-center gap-3 bg-[#F3EEFB] rounded-xl px-4 py-3.5 mb-2.5 no-underline">
                <div className="text-xl">📞</div>
                <div>
                  <div className="text-sm font-bold text-[#1A2027]">{result.phone}</div>
                  <div className="text-[11px] text-[#7A56C8]">Click to call</div>
                </div>
              </a>
              {result.altPhone && (
                <a href={`tel:${result.altPhone}`} className="flex items-center gap-3 bg-[#F7F9FA] rounded-xl px-4 py-3.5 mb-2.5 no-underline">
                  <div className="text-xl">📞</div>
                  <div>
                    <div className="text-sm font-bold text-[#1A2027]">{result.altPhone}</div>
                    <div className="text-[11px] text-[#8A96A3]">Alternative number</div>
                  </div>
                </a>
              )}
              {address && (
                <div className="flex items-start gap-3 mt-3">
                  <div className="text-lg">📍</div>
                  <div className="text-[13px] text-[#3A4652] leading-relaxed">
                    {address}
                    {result.mapLink && (
                      <div>
                        <a href={result.mapLink} target="_blank" rel="noopener noreferrer" className="text-xs text-[#7A56C8] font-semibold">
                          View on Google Maps →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {result.notes && (
              <div className="bg-[#FFF8EA] border border-[#F0DFAE] rounded-2xl px-5 py-[18px] mb-5">
                <div className="text-xs font-bold text-[#6B5D2E] tracking-[0.5px] mb-1.5">📝 NOTES FOR CARE</div>
                <div className="text-[13px] text-[#6B5D2E] leading-relaxed">{result.notes}</div>
              </div>
            )}

            <div className="text-center text-xs text-[#B0B8BF]">Microchip {result.mcNumber} · Registered with City Pet House</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{ background: "linear-gradient(90deg, #7A56C8, #4E3A8A)" }}
        className="px-9 py-10 flex items-center justify-between gap-6 flex-wrap"
      >
        <div>
          <div className="font-heading font-bold text-[30px] text-white mb-1.5">{content.bannerTitle}</div>
          <div className="text-[15px] text-white/85">{content.bannerSubtitle}</div>
        </div>
        <div className="text-sm text-white/80 font-semibold tracking-[0.5px]">💠 CITY PET HOUSE · MICROCHIP REGISTRY</div>
      </div>

      <div className="flex gap-10 px-8 py-11 items-start flex-wrap lg:flex-nowrap">
        <div className="w-full lg:w-[280px] shrink-0 lg:sticky lg:top-5">
          <div className="border border-[#E4E9EC] rounded-[10px] overflow-hidden mb-4">
            <div className="h-1 bg-[#7A56C8]" />
            <div className="p-6">
              <div className="text-[13px] font-bold text-[#1A2027] mb-3.5">Search This Archive</div>
              {accessAllowed ? (
                <>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    placeholder="Microchip number or pet name"
                    className="w-full box-border px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-2.5"
                  />
                  <button onClick={submit} className="w-full bg-[#7A56C8] text-white text-center py-2.5 rounded-lg text-[13px] font-bold cursor-pointer mb-2.5">
                    Search
                  </button>
                  {submitted && !result && <div className="text-xs text-[#D64545] mb-1.5">No pet found matching that microchip number or name.</div>}
                </>
              ) : (
                <div className="text-xs text-[#8A96A3] leading-relaxed bg-[#F7F9FA] rounded-lg px-3 py-2.5 mb-1.5">
                  🔒 Only signed-in vets or B2B suppliers can search owner contact details. {" "}
                  <Link href="/doctor/login" className="text-[#7A56C8] font-semibold">
                    Sign in as a vet
                  </Link>{" "}
                  or{" "}
                  <Link href="/b2b/login" className="text-[#7A56C8] font-semibold">
                    B2B supplier
                  </Link>
                  .
                </div>
              )}
              <div className="text-xs text-[#8A96A3] leading-relaxed mt-1.5">{content.searchCaption}</div>
            </div>
          </div>

          <div className="border border-[#7A56C8]/30 rounded-[10px] overflow-hidden bg-[#F9F6FF]">
            <div className="p-6">
              <div className="text-[13px] font-bold text-[#1A2027] mb-1.5">Already Microchipped?</div>
              <div className="text-xs text-[#5B6773] leading-relaxed mb-3.5">
                Register your dog or cat&apos;s microchip number here so we can reach you if they&apos;re ever found.
              </div>
              {registered && <div className="text-xs text-[#1F7A4D] font-semibold mb-2.5">✓ Registered — thank you!</div>}
              <button
                onClick={() => {
                  setRegistered(false);
                  setShowRegister(true);
                }}
                className="w-full bg-white border border-[#7A56C8] text-[#7A56C8] text-center py-2.5 rounded-lg text-[13px] font-bold cursor-pointer"
              >
                Register My Pet
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-[760px] min-w-0">
          <Link href="/" className="text-[13px] text-primary font-semibold mb-4 inline-block">
            ← Back to Home
          </Link>

          <ImagePlaceholder label="Microchipping archive banner image" className="w-full h-[260px] rounded-xl mb-7" />

          {content.sections.map((sec) => (
            <div key={sec.id} className="mb-7">
              <div className="font-heading font-bold text-xl text-[#1A2027] mb-2.5">{sec.heading}</div>
              <div className="text-sm text-[#3A4652] leading-[1.8]">{sec.body}</div>
            </div>
          ))}

          <ImagePlaceholder label="Vet scanning a pet's microchip" className="w-full h-[280px] rounded-xl mb-7" />

          <div className="font-heading font-bold text-[22px] text-[#D2691E] mb-3.5">FAQs about microchipping</div>
          {content.faqs.map((f) => (
            <FaqRow key={f.id} question={f.q} answer={f.a} />
          ))}
        </div>

        <ImagePlaceholder label="Vertical banner" className="hidden lg:block w-[220px] shrink-0 rounded-xl self-stretch" />
      </div>

      {showRegister && (
        <RegisterModal
          form={registerForm}
          setForm={setRegisterForm}
          canSubmit={canRegister}
          onCancel={() => setShowRegister(false)}
          onSubmit={submitRegister}
        />
      )}
    </div>
  );
}

function RegisterModal({
  form,
  setForm,
  canSubmit,
  onCancel,
  onSubmit,
}: {
  form: RegisterForm;
  setForm: (fn: (f: RegisterForm) => RegisterForm) => void;
  canSubmit: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <div onClick={onCancel} className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-[560px] max-h-[85vh] overflow-y-auto p-6">
        <div className="font-heading font-bold text-lg text-[#1A2027] mb-1">Register Your Pet&apos;s Microchip</div>
        <div className="text-xs text-[#8A96A3] mb-5">
          Already microchipped elsewhere or by us? Add the details below so we can reach you if your pet is ever found.
        </div>

        <Field label="Microchip Number *">
          <Input value={form.mcNumber} onChange={(v) => setForm((f) => ({ ...f, mcNumber: v }))} placeholder="15-digit chip number" />
        </Field>

        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Pet's Name *">
            <Input value={form.petName} onChange={(v) => setForm((f) => ({ ...f, petName: v }))} placeholder="e.g. Buddy" />
          </Field>
          <Field label="Sex">
            <select
              value={form.sex}
              onChange={(e) => setForm((f) => ({ ...f, sex: e.target.value as "Male" | "Female" }))}
              className="w-full box-border px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] bg-white mb-3.5"
            >
              <option>Male</option>
              <option>Female</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Breed">
            <Input value={form.breed} onChange={(v) => setForm((f) => ({ ...f, breed: v }))} placeholder="e.g. Labrador" />
          </Field>
          <Field label="Age">
            <Input value={form.age} onChange={(v) => setForm((f) => ({ ...f, age: v }))} placeholder="e.g. 2 years" />
          </Field>
        </div>
        <Field label="Colour">
          <Input value={form.color} onChange={(v) => setForm((f) => ({ ...f, color: v }))} placeholder="e.g. Golden" />
        </Field>

        <div className="mb-3.5">
          <div className="text-xs font-semibold text-[#3A4652] mb-1.5">Pet&apos;s Photo</div>
          <ImageUploadField value={form.photo} onChange={(v) => setForm((f) => ({ ...f, photo: v }))} label="pet photo" height="h-[110px]" maxWidth={800} maxHeight={800} />
        </div>

        <div className="h-px bg-[#E4E9EC] my-4" />

        <Field label="Owner's Name *">
          <Input value={form.ownerName} onChange={(v) => setForm((f) => ({ ...f, ownerName: v }))} placeholder="Your full name" />
        </Field>
        <div className="mb-3.5">
          <div className="text-xs font-semibold text-[#3A4652] mb-1.5">Phone Number *</div>
          <PhoneInput value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} className="" />
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="House No.">
            <Input value={form.houseNo} onChange={(v) => setForm((f) => ({ ...f, houseNo: v }))} placeholder="e.g. 12" />
          </Field>
          <Field label="Municipality">
            <Input value={form.municipality} onChange={(v) => setForm((f) => ({ ...f, municipality: v }))} placeholder="e.g. Gokarneshwor" />
          </Field>
        </div>
        <Field label="Notes">
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={2}
            placeholder="Anything a finder should know (allergies, temperament, etc.)"
            className="w-full box-border rounded-lg border border-[#E4E9EC] px-3 py-2.5 text-[13px] resize-y font-sans mb-1"
          />
        </Field>

        <div className="flex gap-2.5 mt-4">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-[#5B6773] bg-[#F0F2F4] cursor-pointer">
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-white bg-[#7A56C8] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3.5">
      <div className="text-xs font-semibold text-[#3A4652] mb-1.5">{label}</div>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full box-border px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px]"
    />
  );
}

function FaqRow({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-[#E4E9EC]">
      <div onClick={() => setOpen((v) => !v)} className="flex justify-between items-center py-4 cursor-pointer">
        <div className="text-[15px] font-semibold text-[#1A2027]">{question}</div>
        <div className="w-[26px] h-[26px] rounded-full border border-[#C9CDD2] flex items-center justify-center text-sm text-[#5B6773] shrink-0">
          {open ? "−" : "+"}
        </div>
      </div>
      {open && <div className="text-[13px] text-[#5B6773] leading-relaxed pb-4">{answer}</div>}
    </div>
  );
}
