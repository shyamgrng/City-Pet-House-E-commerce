"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useVet } from "@/context/VetContext";

const DATE_CHIPS = ["Today", "Tomorrow", "Wed, Jul 20", "Thu, Jul 21", "Fri, Jul 22"];
const TIME_CHIPS = ["10:00 AM", "11:30 AM", "1:00 PM", "3:00 PM", "5:00 PM"];

function BookInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, ready } = useAuth();
  const { doctors, bookConsult } = useVet();

  const doctorId = searchParams.get("doctor") || doctors[0]?.id || "";
  const doctor = doctors.find((d) => d.id === doctorId) ?? doctors[0];

  const [date, setDate] = useState(DATE_CHIPS[0]);
  const [time, setTime] = useState(TIME_CHIPS[0]);
  const [ownerName, setOwnerName] = useState(user?.name ?? "");
  const [ownerPhone, setOwnerPhone] = useState(user?.phone ?? "");
  const [ownerEmail, setOwnerEmail] = useState(user?.email ?? "");
  const [petName, setPetName] = useState("");
  const [petSpecies, setPetSpecies] = useState("");
  const [petAge, setPetAge] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!ready) return null;

  if (!user) {
    return (
      <div className="px-8 py-16 flex justify-center">
        <div className="max-w-[420px] w-full border border-[#E4E9EC] rounded-2xl p-8 text-center">
          <div className="font-heading font-bold text-lg text-[#1A2027] mb-2">Book a Vet Consult</div>
          <div className="text-[13px] text-[#5B6773] leading-relaxed mb-6">
            You need a free account to book a vet consult — this helps our doctors follow up with you.
          </div>
          <Link
            href={`/signin?redirect=${encodeURIComponent("/vet/book?doctor=" + doctorId)}`}
            className="block w-full bg-primary text-white text-center py-3 rounded-[9px] text-sm font-semibold"
          >
            Sign In or Create Account
          </Link>
        </div>
      </div>
    );
  }

  if (!doctor) return null;

  const submit = () => {
    if (!ownerName.trim() || !ownerPhone.trim() || !ownerEmail.trim() || !petName.trim() || !petSpecies.trim() || !petAge.trim() || !reason.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    const booking = bookConsult({
      ownerId: user.id,
      ownerName,
      ownerPhone,
      ownerEmail,
      petName,
      petSpecies,
      petAge,
      reason,
      doctorId: doctor.id,
      doctorName: doctor.name,
      instant: doctor.online,
      scheduledDate: doctor.online ? "" : date,
      scheduledTime: doctor.online ? "" : time,
      amount: 800,
    });
    router.push(`/vet/payment/${booking.id}`);
  };

  return (
    <div className="px-8 py-7 max-w-[600px]">
      <Link href="/vet" className="text-[13px] text-primary font-semibold mb-4 inline-block">
        ← Back to Web Vet
      </Link>
      <div className="font-heading font-bold text-xl text-[#1A2027] mb-1.5">Book a Vet Consult</div>
      <div className="text-[13px] text-[#5B6773] mb-5">
        Doctor: <strong className="text-[#1A2027]">{doctor.name}</strong>
      </div>

      {doctor.online ? (
        <div className="text-[13px] text-[#1F7A4D] font-semibold bg-[#EAF6EE] px-3.5 py-2.5 rounded-[9px] mb-5">
          This doctor is online now — your consult starts as soon as payment is approved.
        </div>
      ) : (
        <>
          <div className="text-xs font-semibold text-[#3A4652] mb-2">Preferred Date</div>
          <div className="flex gap-2 mb-4 flex-wrap">
            {DATE_CHIPS.map((d) => (
              <Chip key={d} active={date === d} onClick={() => setDate(d)} label={d} />
            ))}
          </div>
          <div className="text-xs font-semibold text-[#3A4652] mb-2">Preferred Time</div>
          <div className="flex gap-2 mb-5 flex-wrap">
            {TIME_CHIPS.map((t) => (
              <Chip key={t} active={time === t} onClick={() => setTime(t)} label={t} />
            ))}
          </div>
        </>
      )}

      <div className="text-[13px] font-bold text-[#1A2027] mb-3">Owner Details</div>
      <Field label="Full Name" required value={ownerName} onChange={setOwnerName} placeholder="Your full name" />
      <div className="flex gap-3">
        <div className="flex-1">
          <Field label="Phone" required value={ownerPhone} onChange={setOwnerPhone} placeholder="98XXXXXXXX" />
        </div>
        <div className="flex-1">
          <Field label="Email" required value={ownerEmail} onChange={setOwnerEmail} placeholder="you@example.com" />
        </div>
      </div>

      <div className="text-[13px] font-bold text-[#1A2027] my-3">Pet Details</div>
      <div className="flex gap-3">
        <div className="flex-1">
          <Field label="Pet Name" required value={petName} onChange={setPetName} placeholder="e.g. Bruno" />
        </div>
        <div className="flex-1">
          <Field label="Species & Breed" required value={petSpecies} onChange={setPetSpecies} placeholder="e.g. Dog — Labrador" />
        </div>
      </div>
      <Field label="Pet Age" required value={petAge} onChange={setPetAge} placeholder="e.g. 2 yrs" />
      <Field label="Reason for Visit" required value={reason} onChange={setReason} placeholder="Symptoms, checkup type, etc." mb="mb-4" />

      {error && <div className="text-xs text-[#D64545] mb-2.5">{error}</div>}
      <button onClick={submit} className="w-full bg-primary text-white text-center py-3.5 rounded-[9px] text-sm font-semibold cursor-pointer">
        Continue to Payment
      </button>
    </div>
  );
}

export default function BookVetPage() {
  return (
    <Suspense fallback={null}>
      <BookInner />
    </Suspense>
  );
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="px-3.5 py-2 rounded-full text-xs font-semibold cursor-pointer"
      style={{ background: active ? "#1996C8" : "#F0F2F4", color: active ? "#fff" : "#3A4652" }}
    >
      {label}
    </button>
  );
}

function Field({
  label,
  required,
  value,
  onChange,
  placeholder,
  mb = "mb-3.5",
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
      <div className="text-xs font-semibold text-[#3A4652] mb-1.5">
        {label} {required && <span className="text-[#D64545]">*</span>}
      </div>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-10 rounded-lg border border-[#E4E9EC] px-3 text-[13px] text-[#1A2027] box-border ${mb}`}
      />
    </div>
  );
}
