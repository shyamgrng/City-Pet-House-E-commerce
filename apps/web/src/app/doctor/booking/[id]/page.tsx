"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import ConsultRoom from "@/components/vet/ConsultRoom";
import { useDoctorAuth } from "@/context/DoctorAuthContext";
import { useVet } from "@/context/VetContext";
import { STATUS_COLORS } from "@/lib/vet-types";

export default function DoctorBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { doctor, ready } = useDoctorAuth();
  const { bookings, startCall, endCall, setDoctorNote, addDoctorDocument } = useVet();
  const router = useRouter();
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [docSaved, setDocSaved] = useState(false);

  useEffect(() => {
    if (ready && !doctor) router.replace("/doctor/login");
  }, [ready, doctor, router]);

  const booking = bookings.find((b) => b.id === id);

  if (!ready || !doctor) return null;

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#F7F9FA] px-8 py-10 text-center text-sm text-[#8A96A3]">
        Booking not found. <Link href="/doctor" className="text-primary font-semibold">Back to Portal</Link>
      </div>
    );
  }

  const saveNote = () => {
    if (!note.trim()) return;
    setDoctorNote(booking.id, note);
    setNote("");
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 3000);
  };

  const uploadPrescription = () => {
    addDoctorDocument(booking.id, "prescription.pdf");
    setDocSaved(true);
    setTimeout(() => setDocSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FA]">
      <div className="px-8 py-7 max-w-[760px]">
        <Link href="/doctor" className="text-[13px] text-primary font-semibold mb-4 inline-block">
          ← Back to Bookings
        </Link>
        <div className="flex justify-between items-center mb-1">
          <div className="text-[15px] font-bold text-[#1A2027]">
            {booking.ownerName} — {booking.petName}
          </div>
          <div className="text-[11px] font-semibold" style={{ color: STATUS_COLORS[booking.status] }}>
            {booking.status}
          </div>
        </div>
        <div className="text-xs text-[#8A96A3] mb-5">
          {booking.instant ? "Online now" : `${booking.scheduledDate} ${booking.scheduledTime}`} · {booking.reason}
        </div>

        <div className="border border-[#E4E9EC] rounded-xl p-4 mb-4">
          <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Pet Owner Details</div>
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <DetailField label="Owner Name" value={booking.ownerName} />
            <DetailField label="Pet Name" value={booking.petName} />
            <DetailField label="Phone" value={booking.ownerPhone} />
            <DetailField label="Species" value={booking.petSpecies} />
            <DetailField label="Pet Age" value={booking.petAge} />
            <DetailField label="Reason" value={booking.reason} />
          </div>
        </div>

        <div className="border border-[#E4E9EC] rounded-xl p-4 mb-4">
          <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Client Shared Files</div>
          {booking.clientDocuments.length === 0 ? (
            <div className="text-xs text-[#8A96A3]">No files shared by the client yet</div>
          ) : (
            booking.clientDocuments.map((d, i) => (
              <div key={i} className="text-xs text-[#3A4652] py-1.5 border-b border-[#F0F2F4] last:border-0">
                📎 {d.name}
              </div>
            ))
          )}
        </div>

        {(booking.status === "Confirmed" || booking.status === "In Progress") && (
          <div className="mb-4">
            {booking.status === "In Progress" ? (
              <ConsultRoom booking={booking} viewer="doctor" />
            ) : (
              <button
                onClick={() => startCall(booking.id)}
                className="bg-[#1F7A4D] text-white text-center py-3 rounded-[9px] text-[13px] font-semibold cursor-pointer px-6"
              >
                📹 Start Call
              </button>
            )}
          </div>
        )}

        <div className="border border-[#E4E9EC] rounded-xl p-4 mb-4">
          <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Doctor&apos;s Note</div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Diagnosis, advice, follow-up..."
            className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-2.5 box-border"
          />
          <button onClick={saveNote} className="bg-primary text-white text-center py-2.5 px-[18px] rounded-lg text-xs font-semibold cursor-pointer">
            Update
          </button>
          {noteSaved && <div className="text-[11px] text-[#1F7A4D] mt-2">✓ Saved to client&apos;s account — emailed to {booking.ownerName}</div>}
          {booking.noteHistory.length > 0 && (
            <>
              <div className="text-xs font-bold text-[#1A2027] mt-3.5 mb-1.5">Note History</div>
              {booking.noteHistory.map((n, i) => (
                <div key={i} className="text-xs text-[#3A4652] py-1.5 border-t border-[#F0F2F4]">
                  <span className="text-[#8A96A3]">{n.date} — {n.doctor}:</span> {n.text}
                </div>
              ))}
            </>
          )}
        </div>

        <div className="border border-[#E4E9EC] rounded-xl p-4 mb-4">
          <div className="text-[13px] font-bold text-[#1A2027] mb-2">Upload Prescription / Document for Client</div>
          <div className="text-[11px] text-[#8A96A3] mb-2.5">
            Prescriptions, lab reports, or photos — visible to the client in their Vet Consults detail.
          </div>
          <button
            onClick={uploadPrescription}
            className="w-full h-[100px] mb-2.5 rounded-lg border-2 border-dashed border-[#E4E9EC] flex items-center justify-center text-xs text-[#8A96A3] cursor-pointer"
          >
            Drop a document or photo
          </button>
          <button onClick={uploadPrescription} className="bg-primary text-white px-[18px] py-2.5 rounded-lg text-xs font-semibold cursor-pointer">
            Update
          </button>
          {docSaved && <div className="text-[11px] text-[#1F7A4D] mt-2">✓ Saved to client&apos;s account — emailed to {booking.ownerName}</div>}
        </div>

        {booking.status === "In Progress" && (
          <button
            onClick={() => endCall(booking.id)}
            className="w-full bg-[#D64545] text-white text-center py-3 rounded-[9px] text-[13px] font-semibold cursor-pointer mb-4"
          >
            End Session
          </button>
        )}
        {booking.status === "Completed" && (
          <div className="bg-[#EAF6EE] border border-[#CFE9D8] rounded-[10px] px-3.5 py-3 text-xs text-[#1F7A4D] mb-4">✓ Session ended</div>
        )}

        <div className="border border-[#E4E9EC] rounded-xl p-4">
          <div className="text-[13px] font-semibold text-[#1A2027] mb-1.5">Consult Fee</div>
          <div className="text-[13px] text-[#5B6773]">
            Rs. {booking.amount} · Invoice {booking.invoiceNumber}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[#8A96A3] mb-0.5">{label}</div>
      <div className="font-semibold text-[#1A2027]">{value}</div>
    </div>
  );
}
