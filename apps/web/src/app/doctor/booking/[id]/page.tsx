"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import ConsultRoom from "@/components/vet/ConsultRoom";
import { useDoctorAuth } from "@/context/DoctorAuthContext";
import { useVet } from "@/context/VetContext";
import { STATUS_COLORS, type VetBooking } from "@/lib/vet-types";

export default function DoctorBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { doctor, ready } = useDoctorAuth();
  const { bookings, startCall, endCall, refreshBooking } = useVet();
  const router = useRouter();

  useEffect(() => {
    if (ready && !doctor) router.replace("/doctor/login");
  }, [ready, doctor, router]);

  const booking = bookings.find((b) => b.id === id);

  // Backstop for the realtime push -- polls on every non-final status so this page notices
  // admin approving payment (which is what makes the chat/call UI appear below) without a
  // manual refresh. Without this, the doctor would never see a booking flip out of
  // "Payment Review" until they happened to reload the page.
  const isFinal = booking?.status === "Completed" || booking?.status === "Payment Rejected" || booking?.status === "Cancelled";
  useEffect(() => {
    if (!booking || isFinal) return;
    const interval = setInterval(() => refreshBooking(id), 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isFinal, !!booking]);

  if (!ready || !doctor) return null;

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#F7F9FA] px-8 py-10 text-center text-sm text-[#8A96A3]">
        Booking not found. <Link href="/doctor" className="text-primary font-semibold">Back to Portal</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FA]">
      <div className="px-8 py-7 max-w-[760px] mx-auto">
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

        {booking.status === "Confirmed" && (
          <div className="mb-4">
            <ChatPanel booking={booking} onCall={() => startCall(booking.id)} />
          </div>
        )}
        {booking.status === "In Progress" && (
          <div className="mb-4">
            <ConsultRoom booking={booking} viewer="doctor" />
          </div>
        )}

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

/** Chat available as soon as the consult is confirmed -- the call icons launch the actual
 * video call (transitions the booking to "In Progress", which mounts ConsultRoom). */
function ChatPanel({ booking, onCall }: { booking: VetBooking; onCall: () => void }) {
  const { sendMessage } = useVet();
  const [chatInput, setChatInput] = useState("");

  const send = () => {
    if (!chatInput.trim()) return;
    sendMessage(booking.id, "doctor", chatInput);
    setChatInput("");
  };

  return (
    <div className="border border-[#E4E9EC] rounded-xl p-4">
      <div className="flex justify-between items-center mb-3">
        <div className="text-[15px] font-bold text-[#1A2027] flex items-center gap-2">
          Chat with {booking.ownerName}
          <span className="text-xs font-semibold text-[#1F7A4D] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1F7A4D] inline-block" />
            Online
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCall}
            title="Audio call"
            className="w-9 h-9 rounded-full bg-[#EAF4F9] text-primary flex items-center justify-center cursor-pointer text-lg leading-none"
          >
            📞
          </button>
          <button
            onClick={onCall}
            title="Video call"
            className="w-9 h-9 rounded-full bg-[#EAF4F9] text-primary flex items-center justify-center cursor-pointer text-lg leading-none"
          >
            🎥
          </button>
        </div>
      </div>
      <div className="h-[260px] overflow-y-auto flex flex-col gap-2 mb-3">
        {booking.chatMessages.length === 0 ? (
          <div className="text-xs text-[#8A96A3] text-center mt-16">No messages yet</div>
        ) : (
          booking.chatMessages.map((msg, i) => {
            const mine = msg.from === "doctor";
            return (
              <div
                key={i}
                className="max-w-[75%] px-3 py-2 text-xs leading-relaxed"
                style={{
                  alignSelf: mine ? "flex-end" : "flex-start",
                  background: mine ? "#1996C8" : "#F0F2F4",
                  color: mine ? "#fff" : "#1A2027",
                  borderRadius: mine ? "11px 11px 2px 11px" : "11px 11px 11px 2px",
                }}
              >
                {msg.text}
              </div>
            );
          })
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Reply to client…"
          className="flex-1 h-10 rounded-md border border-[#E4E9EC] px-3 text-xs box-border"
        />
        <button onClick={send} className="bg-primary text-white px-4 rounded-md text-xs font-semibold cursor-pointer">
          Send
        </button>
      </div>
    </div>
  );
}
