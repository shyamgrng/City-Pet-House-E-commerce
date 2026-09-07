"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import ConsultRoom from "@/components/vet/ConsultRoom";
import PrescriptionPad from "@/components/vet/PrescriptionPad";
import { useDoctorAuth } from "@/context/DoctorAuthContext";
import { useVet } from "@/context/VetContext";
import { STATUS_COLORS, type VetBooking } from "@/lib/vet-types";

export default function DoctorBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { doctor, ready } = useDoctorAuth();
  const { bookings, startCall, endCall, refreshBooking } = useVet();
  const router = useRouter();
  const consultRef = useRef<HTMLDivElement>(null);
  const [consultHeight, setConsultHeight] = useState<number | null>(null);

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

  // Keeps the prescription card's height locked to the live consult card's rendered height (on
  // desktop, where they sit side by side) so the letterhead's bottom edge lines up with the
  // chat box's bottom edge instead of trailing further down the page -- the form fields inside
  // scroll internally instead of pushing the card taller.
  useEffect(() => {
    if (booking?.status !== "In Progress" || !consultRef.current) {
      setConsultHeight(null);
      return;
    }
    const el = consultRef.current;
    const update = () => setConsultHeight(window.innerWidth >= 1024 ? el.offsetHeight : null);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [booking?.status]);

  if (!ready || !doctor) return null;

  if (!booking) {
    return (
      <div className="min-h-screen bg-white px-8 py-10 text-center text-sm text-[#8A96A3]">
        Booking not found. <Link href="/doctor" className="text-primary font-semibold">Back to Portal</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="h-16 w-full" style={{ background: "linear-gradient(90deg, #1996C8, #4CC3E8)" }} />
      <div className="px-8 py-7 max-w-[1440px] mx-auto">
        <div>
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
        </div>

        <div className="border border-[#E4E9EC] rounded-2xl p-7 mb-4 bg-white shadow-[0_1px_2px_rgba(16,24,32,0.04)]">
          <div className="flex items-center justify-between mb-6 pb-5 border-b border-[#F0F2F4]">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-full bg-[#EAF4F9] text-primary font-bold text-lg flex items-center justify-center shrink-0">
                {initials(booking.ownerName)}
              </div>
              <div>
                <div className="text-lg font-bold text-[#1A2027]">{booking.ownerName}</div>
                <div className="text-xs text-[#8A96A3]">Pet Owner</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[#F7F9FA] border border-[#E4E9EC] rounded-full pl-3 pr-4 py-2">
              <span className="text-xl">{petEmoji(booking.petSpecies)}</span>
              <span className="text-base font-bold text-[#1A2027]">{booking.petName}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 text-sm">
            <div>
              <div className="text-[11px] font-bold text-[#8A96A3] uppercase tracking-wide mb-4">Owner Details</div>
              <div className="flex flex-col gap-5">
                <IconDetail icon="👤" label="Full Name">
                  {booking.ownerName}
                </IconDetail>
                <IconDetail icon="📞" label="Phone">
                  <a href={`tel:${booking.ownerPhone}`} className="font-bold text-primary hover:underline">
                    {booking.ownerPhone}
                  </a>
                </IconDetail>
                <IconDetail icon="✉️" label="Email">
                  {booking.ownerEmail ? (
                    <a href={`mailto:${booking.ownerEmail}`} className="font-bold text-primary hover:underline break-all">
                      {booking.ownerEmail}
                    </a>
                  ) : (
                    "—"
                  )}
                </IconDetail>
                <IconDetail icon="🗓️" label="Consult">
                  {booking.instant ? "Instant · Online now" : `${booking.scheduledDate} · ${booking.scheduledTime}`}
                </IconDetail>
              </div>
            </div>
            <div className="md:border-l md:border-[#F0F2F4] md:pl-8">
              <div className="text-[11px] font-bold text-[#8A96A3] uppercase tracking-wide mb-4">Pet Details</div>
              <div className="flex flex-col gap-5">
                <IconDetail icon={petEmoji(booking.petSpecies)} label="Pet Name">
                  {booking.petName}
                </IconDetail>
                <IconDetail icon={petEmoji(booking.petSpecies)} label="Species">
                  {booking.petSpecies}
                </IconDetail>
                <IconDetail icon="🎂" label="Pet Age">
                  {booking.petAge}
                </IconDetail>
                <IconDetail icon="📝" label="Reason for Visit">
                  {booking.reason}
                </IconDetail>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[760px] mx-auto">
          {booking.status === "Confirmed" && (
            <div className="mb-4">
              <ChatPanel booking={booking} onCall={() => startCall(booking.id)} />
            </div>
          )}
        </div>

        {booking.status === "In Progress" && (
          <div className="flex flex-col lg:flex-row gap-4 items-start mb-4">
            <div className="flex-1 min-w-0 w-full" ref={consultRef}>
              <ConsultRoom booking={booking} viewer="doctor" />
            </div>
            <div
              className={`w-full lg:w-[560px] shrink-0 ${consultHeight ? "lg:overflow-hidden" : ""}`}
              style={consultHeight ? { height: consultHeight } : undefined}
            >
              <PrescriptionPad booking={booking} fillHeight={!!consultHeight} />
            </div>
          </div>
        )}

        <div className="max-w-[760px]">
          {booking.status === "In Progress" && (
            <button
              onClick={() => endCall(booking.id)}
              className="w-full bg-[#D64545] text-white text-center py-3 rounded-[9px] text-[13px] font-semibold cursor-pointer mb-4"
            >
              End Session
            </button>
          )}
          {booking.status === "Completed" && (
            <>
              <div className="bg-[#EAF6EE] border border-[#CFE9D8] rounded-[10px] px-3.5 py-3 text-xs text-[#1F7A4D] mb-4">✓ Session ended</div>
              <div className="mb-4">
                <PrescriptionPad booking={booking} />
              </div>
            </>
          )}

          <div className="border border-[#E4E9EC] rounded-xl p-4 bg-white">
            <div className="text-[13px] font-semibold text-[#1A2027] mb-1.5">Consult Fee</div>
            <div className="text-[13px] text-[#5B6773]">
              Rs. {booking.amount} · Invoice {booking.invoiceNumber}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

function petEmoji(species: string): string {
  const s = species.toLowerCase();
  if (s.includes("dog")) return "🐶";
  if (s.includes("cat")) return "🐱";
  if (s.includes("bird")) return "🐦";
  if (s.includes("rabbit")) return "🐰";
  return "🐾";
}

function IconDetail({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-9 h-9 rounded-full bg-[#F7F9FA] flex items-center justify-center text-base shrink-0">{icon}</div>
      <div>
        <div className="text-xs text-[#8A96A3] mb-0.5">{label}</div>
        <div className="font-bold text-[15px] text-[#1A2027]">{children}</div>
      </div>
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
    <div className="border border-[#E4E9EC] rounded-xl p-4 bg-white">
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
