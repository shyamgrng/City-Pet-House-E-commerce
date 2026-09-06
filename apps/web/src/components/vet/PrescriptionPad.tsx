"use client";

import { useState } from "react";
import { useVet } from "@/context/VetContext";
import type { Prescription, PrescriptionMedicine, VetBooking } from "@/lib/vet-types";

const EMPTY_MEDICINE: PrescriptionMedicine = { name: "", dosage: "", frequency: "", duration: "" };

function emptyDraft(): Prescription {
  return { history: "", diagnosis: "", medicines: [{ ...EMPTY_MEDICINE }], advice: "", updatedAt: 0, sentAt: null };
}

/**
 * The clinic's actual letterhead (header/footer images, supplied by the clinic) with the
 * consult record filled in between and the official stamp placed by the doctor's signature.
 *
 * Local draft state is only ever seeded from booking.prescription once (lazy initializer),
 * never re-synced from it on every render -- otherwise the polling refresh every few seconds
 * would stomp on whatever the doctor is mid-typing.
 */
export default function PrescriptionPad({ booking }: { booking: VetBooking }) {
  const { doctors, savePrescriptionDraft, sendPrescription, saveError } = useVet();
  const [draft, setDraft] = useState<Prescription>(() => booking.prescription ?? emptyDraft());
  const [savedNotice, setSavedNotice] = useState(false);
  const [sending, setSending] = useState(false);

  const doctor = doctors.find((d) => d.id === booking.doctorId);
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const updateMedicine = (index: number, field: keyof PrescriptionMedicine, value: string) => {
    setDraft((d) => ({ ...d, medicines: d.medicines.map((m, i) => (i === index ? { ...m, [field]: value } : m)) }));
  };

  const addMedicine = () => setDraft((d) => ({ ...d, medicines: [...d.medicines, { ...EMPTY_MEDICINE }] }));
  const removeMedicine = (index: number) => setDraft((d) => ({ ...d, medicines: d.medicines.filter((_, i) => i !== index) }));

  const saveDraft = () => {
    savePrescriptionDraft(booking.id, { ...draft, updatedAt: Date.now() });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const send = () => {
    setSending(true);
    const sentAt = Date.now();
    sendPrescription(booking.id, { ...draft, updatedAt: sentAt });
    setDraft((d) => ({ ...d, sentAt }));
    setSending(false);
  };

  return (
    <div className="border border-[#E4E9EC] rounded-2xl overflow-hidden bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/vet-letterhead-header.png" alt="" className="w-full h-auto block" />

      <div className="px-6 py-4 flex flex-col gap-6">
        <div className="text-right">
          <span className="text-[10px] text-[#8A96A3]">Date: </span>
          <span className="text-xs font-semibold text-[#1A2027]">{today}</span>
        </div>

        <div className="border border-[#E4E9EC] rounded-md overflow-hidden text-xs">
          <div className="grid grid-cols-2 border-b border-[#E4E9EC]">
            <div className="px-3 py-1.5 font-bold text-[#1A2027] border-r border-[#E4E9EC]">Owner&apos;s Details</div>
            <div className="px-3 py-1.5 font-bold text-[#1A2027]">Pet&apos;s Details</div>
          </div>
          <div className="grid grid-cols-2">
            <div className="px-3 py-2 border-r border-[#E4E9EC] flex flex-col gap-1">
              <div><span className="text-[#8A96A3]">Name </span><span className="font-semibold text-[#1A2027]">{booking.ownerName}</span></div>
              <div><span className="text-[#8A96A3]">Phone </span><span className="font-semibold text-[#1A2027]">{booking.ownerPhone}</span></div>
              <div><span className="text-[#8A96A3]">Email </span><span className="font-semibold text-[#1A2027]">{booking.ownerEmail || "—"}</span></div>
            </div>
            <div className="px-3 py-2 flex flex-col gap-1">
              <div><span className="text-[#8A96A3]">Name </span><span className="font-semibold text-[#1A2027]">{booking.petName}</span></div>
              <div><span className="text-[#8A96A3]">Species </span><span className="font-semibold text-[#1A2027]">{booking.petSpecies}</span></div>
              <div><span className="text-[#8A96A3]">Age </span><span className="font-semibold text-[#1A2027]">{booking.petAge}</span></div>
              <div><span className="text-[#8A96A3]">Reason </span><span className="font-semibold text-[#1A2027]">{booking.reason}</span></div>
            </div>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-[#8A96A3] uppercase tracking-wide mb-1.5 block">Hx</label>
          <textarea
            value={draft.history}
            onChange={(e) => setDraft((d) => ({ ...d, history: e.target.value }))}
            placeholder="Past conditions, previous treatments, vaccination history…"
            className="w-full min-h-[60px] rounded-md border border-[#E4E9EC] px-3 py-2 text-xs resize-y box-border"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-[#8A96A3] uppercase tracking-wide mb-1.5 block">Diagnosis</label>
          <textarea
            value={draft.diagnosis}
            onChange={(e) => setDraft((d) => ({ ...d, diagnosis: e.target.value }))}
            placeholder="Findings, diagnosis, observations…"
            className="w-full min-h-[70px] rounded-md border border-[#E4E9EC] px-3 py-2 text-xs resize-y box-border"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[11px] font-semibold text-[#8A96A3] uppercase tracking-wide">Rx</label>
            <button type="button" onClick={addMedicine} className="text-[11px] text-primary font-semibold cursor-pointer">
              + Add Medicine
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {draft.medicines.map((m, i) => (
              <div key={i} className="border border-[#E4E9EC] rounded-md p-2.5 flex flex-col gap-1.5">
                <div className="flex gap-1.5 items-center">
                  <input
                    value={m.name}
                    onChange={(e) => updateMedicine(i, "name", e.target.value)}
                    placeholder="Medicine name"
                    className="flex-1 h-8 rounded border border-[#E4E9EC] px-2 text-xs box-border font-semibold"
                  />
                  {draft.medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicine(i)}
                      title="Remove"
                      className="w-8 h-8 shrink-0 rounded border border-[#E4E9EC] text-[#D64545] cursor-pointer text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <input
                    value={m.dosage}
                    onChange={(e) => updateMedicine(i, "dosage", e.target.value)}
                    placeholder="Dosage (e.g. 5mg)"
                    className="h-8 rounded border border-[#E4E9EC] px-2 text-xs box-border"
                  />
                  <input
                    value={m.frequency}
                    onChange={(e) => updateMedicine(i, "frequency", e.target.value)}
                    placeholder="Frequency (e.g. 2x/day)"
                    className="h-8 rounded border border-[#E4E9EC] px-2 text-xs box-border"
                  />
                  <input
                    value={m.duration}
                    onChange={(e) => updateMedicine(i, "duration", e.target.value)}
                    placeholder="Duration (e.g. 5 days)"
                    className="h-8 rounded border border-[#E4E9EC] px-2 text-xs box-border"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-[#8A96A3] uppercase tracking-wide mb-1.5 block">Advice / Follow-up</label>
          <textarea
            value={draft.advice}
            onChange={(e) => setDraft((d) => ({ ...d, advice: e.target.value }))}
            placeholder="Diet, care instructions, follow-up date…"
            className="w-full min-h-[60px] rounded-md border border-[#E4E9EC] px-3 py-2 text-xs resize-y box-border"
          />
        </div>

        {saveError && <div className="text-[11px] text-[#D64545]">{saveError}</div>}

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={saveDraft}
            className="px-3.5 py-2 rounded-md border border-[#E4E9EC] text-xs font-semibold text-[#3A4652] cursor-pointer"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={send}
            disabled={sending}
            className="flex-1 bg-[#1F7A4D] text-white py-2 rounded-md text-xs font-semibold cursor-pointer disabled:opacity-60"
          >
            {draft.sentAt ? "Update & Resend to Patient" : "Send to Patient"}
          </button>
        </div>
        <div className="text-[11px] text-[#8A96A3]">
          Will be sent to <span className="font-semibold text-[#3A4652]">{booking.ownerEmail || "—"}</span> — please confirm this is correct before sending.
        </div>
        {savedNotice && <div className="text-[11px] text-[#1F7A4D]">Draft saved.</div>}
      </div>

      {/* Signature block: doctor's name/qualification/NVC number with the clinic's official
       * stamp placed right up against the name, matching the emailed letterhead PDF. */}
      <div className="px-6 pt-2 pb-5 flex items-start gap-2">
        <div>
          <div className="text-[13px] font-bold text-[#1A2027]">{booking.doctorName}</div>
          {doctor && <div className="text-[10px] text-[#8A96A3]">{doctor.qualification}</div>}
          {doctor && <div className="text-[10px] text-[#8A96A3]">NVC No: {doctor.nvcNumber}</div>}
          {draft.sentAt && (
            <div className="text-[10px] text-[#8A96A3] mt-1">
              Sent {new Date(draft.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
            </div>
          )}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/vet-clinic-stamp.png" alt="Clinic stamp" className="w-16 h-16 object-contain shrink-0 opacity-90 -mt-1" />
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/vet-letterhead-footer.png" alt="" className="w-full h-auto block" />
    </div>
  );
}
