"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useVet } from "@/context/VetContext";
import ConsultRoom from "@/components/vet/ConsultRoom";

/** Ticks up from when this page first saw the booking as Confirmed -- there's no reliable,
 * cross-device "confirmed at" timestamp to count down from (scheduled times are stored as
 * display strings like "Tomorrow" / "3:00 PM", not parseable dates), so this shows how long
 * they've been waiting rather than a countdown to an exact moment. */
function WaitingTimer() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => setSeconds(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return (
    <span className="font-mono tabular-nums">
      {mm}:{ss}
    </span>
  );
}

export default function VetStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { bookings, refreshBooking } = useVet();
  const [callJoined, setCallJoined] = useState(false);
  const booking = bookings.find((b) => b.id === id);

  // Backstop for the realtime push -- polls on every screen of this page (not just the
  // "Confirmed" one) so admin approving payment, the doctor reconfirming, and the doctor
  // starting the call all show up here without a manual refresh. Stops once the booking reaches
  // a final state (nothing more can change after that).
  const isFinal = booking?.status === "Completed" || booking?.status === "Payment Rejected" || booking?.status === "Cancelled";
  useEffect(() => {
    if (!booking || isFinal) return;
    const interval = setInterval(() => refreshBooking(id), 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isFinal, !!booking]);

  if (!booking) {
    return (
      <div className="px-8 py-10 text-center text-sm text-[#8A96A3]">
        Booking not found. <Link href="/vet" className="text-primary font-semibold">Back to Web Vet</Link>
      </div>
    );
  }

  if (booking.status === "Completed") {
    return (
      <div className="px-8 py-16 flex justify-center">
        <div className="max-w-[720px] w-full text-center bg-[#F7F9FA] border border-[#E4E9EC] rounded-2xl px-12 py-14">
          <div className="text-5xl mb-4">✓</div>
          <div className="font-heading font-bold text-2xl text-[#1A2027] mb-3">Thank You!</div>
          <div className="text-base text-[#5B6773] leading-relaxed">
            Your consult with {booking.doctorName} has ended. Thank you for choosing City Pet House &amp; Animal Clinic — a summary of your
            consult has been emailed to you.
          </div>
        </div>
      </div>
    );
  }

  if (booking.status === "Payment Rejected") {
    return (
      <div className="px-8 py-16 flex justify-center">
        <div className="max-w-[720px] w-full text-center bg-[#FDEDEC] border border-[#F3C7C3] rounded-2xl px-12 py-14">
          <div className="text-5xl mb-4">✕</div>
          <div className="font-heading font-bold text-2xl text-[#1A2027] mb-3">Payment Receipt Rejected</div>
          <div className="text-base text-[#8A3A34] leading-relaxed mb-4">
            We couldn&apos;t verify the payment receipt for your consult with {booking.doctorName}.
          </div>
          {booking.rejectReason && (
            <div className="bg-white border border-[#F3C7C3] rounded-[10px] px-[18px] py-3.5 text-[13px] text-[#8A3A34] font-semibold inline-block mb-4">
              Reason: {booking.rejectReason}
            </div>
          )}
          <div>
            <Link href="/vet" className="text-primary font-semibold text-sm">
              Book a new consult →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (booking.status === "Pending Payment") {
    return (
      <div className="px-8 py-16 flex justify-center">
        <div className="max-w-[720px] w-full text-center bg-[#FFF8EA] border border-[#F0DFAE] rounded-2xl px-12 py-14">
          <div className="text-5xl mb-4">⏳</div>
          <div className="font-heading font-bold text-2xl text-[#1A2027] mb-3">Request Sent</div>
          <div className="text-base text-[#6B5D2E] leading-relaxed mb-4">
            Thanks {booking.ownerName} — your request for <strong>Vet Consult</strong> with <strong>{booking.doctorName}</strong> has been
            received. Please complete your payment to confirm your booking.
          </div>
          <Link
            href={`/vet/payment/${booking.id}`}
            className="bg-[#1F7A4D] text-white px-[26px] py-3.5 rounded-[9px] text-[15px] font-semibold inline-block"
          >
            Upload Payment Receipt →
          </Link>
        </div>
      </div>
    );
  }

  if (booking.status === "Payment Review") {
    return (
      <div className="px-8 py-16 flex justify-center">
        <div className="max-w-[720px] w-full text-center bg-[#FFF8EA] border border-[#F0DFAE] rounded-2xl px-12 py-14">
          <div className="text-5xl mb-4">⏳</div>
          <div className="font-heading font-bold text-2xl text-[#1A2027] mb-3">Payment Submitted</div>
          <div className="text-base text-[#6B5D2E] leading-relaxed">
            Thanks {booking.ownerName} — we&apos;ve received your payment receipt for your <strong>Vet Consult</strong> with{" "}
            <strong>{booking.doctorName}</strong>. Our team is verifying it now and you&apos;ll be notified the moment it&apos;s approved.
          </div>
        </div>
      </div>
    );
  }

  const readyForCall = booking.status === "In Progress";
  const inCall = readyForCall && callJoined;

  return (
    <div className="px-8 py-14 flex justify-center">
      <div className="max-w-[720px] w-full">
        {!inCall && (
          <div className="bg-[#EAF6EE] border border-[#CFE9D8] rounded-2xl px-10 py-8 text-center mb-5">
            <div className="text-5xl mb-4">✓</div>
            <div className="font-heading font-bold text-2xl text-[#1A2027] mb-3.5">Payment Approved</div>
            {booking.status === "Awaiting Doctor Reconfirm" ? (
              <>
                <div className="text-base text-[#3A6B4C] leading-relaxed mb-2">
                  Your payment has been verified — we&apos;re confirming your appointment time with {booking.doctorName}. You&apos;ll be
                  notified the moment it&apos;s confirmed.
                </div>
                <div className="bg-white border border-[#CFE9D8] rounded-[10px] px-[18px] py-3.5 text-[13px] text-[#3A6B4C] font-semibold inline-block">
                  Waiting for {booking.doctorName} to reconfirm…
                </div>
              </>
            ) : (
              <>
                <div className="text-base text-[#3A6B4C] leading-relaxed mb-6">
                  Your consult with {booking.doctorName} is ready. Invoice {booking.invoiceNumber} has been emailed to you.
                </div>
                {booking.status === "Confirmed" && (
                  <div className="flex flex-col items-center gap-2.5">
                    <div className="bg-white border border-[#CFE9D8] rounded-[10px] px-[18px] py-3.5 text-[13px] text-[#3A6B4C] font-semibold inline-block">
                      Waiting <WaitingTimer /> — your call will appear here as soon as {booking.doctorName} starts it.
                    </div>
                  </div>
                )}
                {booking.status === "In Progress" && !callJoined && (
                  <div className="flex flex-col items-center gap-2.5">
                    <button
                      onClick={() => setCallJoined(true)}
                      className="bg-[#1F7A4D] text-white px-[26px] py-3.5 rounded-[9px] text-[15px] font-semibold cursor-pointer"
                    >
                      📹 Join Call
                    </button>
                    <div className="text-xs text-[#3A6B4C]">{booking.doctorName} has started the call — join whenever you&apos;re ready.</div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {inCall && <ConsultRoom booking={booking} viewer="client" onLeave={() => setCallJoined(false)} />}
      </div>
    </div>
  );
}
