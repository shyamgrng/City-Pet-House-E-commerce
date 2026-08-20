"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useVet } from "@/context/VetContext";
import ConsultRoom from "@/components/vet/ConsultRoom";

export default function VetStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { bookings } = useVet();
  const [callJoined, setCallJoined] = useState(false);
  const booking = bookings.find((b) => b.id === id);

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
          <div className="font-heading font-bold text-2xl text-[#1A2027] mb-3">Session Ended</div>
          <div className="text-base text-[#5B6773] leading-relaxed">
            Your consult with {booking.doctorName} has ended. A summary email has been sent to you.
          </div>
        </div>
      </div>
    );
  }

  if (booking.status === "Pending Payment" || booking.status === "Payment Review") {
    return (
      <div className="px-8 py-16 flex justify-center">
        <div className="max-w-[720px] w-full text-center bg-[#FFF8EA] border border-[#F0DFAE] rounded-2xl px-12 py-14">
          <div className="text-5xl mb-4">⏳</div>
          <div className="font-heading font-bold text-2xl text-[#1A2027] mb-3">Request Sent</div>
          <div className="text-base text-[#6B5D2E] leading-relaxed">
            Thanks {booking.ownerName} — your request for <strong>Vet Consult</strong> with <strong>{booking.doctorName}</strong> has been
            emailed to our team and to you for confirmation. We will get in touch prior to your booking time. If you need any support please
            contact us.
          </div>
        </div>
      </div>
    );
  }

  const readyForCall = booking.status === "In Progress" || booking.status === "Confirmed";

  return (
    <div className="px-8 py-14 flex justify-center">
      <div className="max-w-[720px] w-full">
        <div className="bg-[#EAF6EE] border border-[#CFE9D8] rounded-2xl px-10 py-8 text-center mb-5">
          <div className="text-5xl mb-4">✓</div>
          <div className="font-heading font-bold text-2xl text-[#1A2027] mb-3.5">Payment Approved</div>
          {!booking.instant && !booking.callStartedByDoctor ? (
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
              {booking.callStartedByDoctor ? (
                !callJoined ? (
                  <div className="flex gap-3.5 justify-center">
                    <button
                      onClick={() => setCallJoined(true)}
                      className="bg-[#1F7A4D] text-white px-[26px] py-3.5 rounded-[9px] text-[15px] font-semibold cursor-pointer"
                    >
                      📹 Join Call
                    </button>
                  </div>
                ) : (
                  <div className="bg-white border border-[#CFE9D8] rounded-[10px] px-4 py-2.5 text-xs text-[#1F7A4D] font-semibold inline-block">
                    🎥 Call in progress below
                  </div>
                )
              ) : (
                <div className="bg-white border border-[#CFE9D8] rounded-[10px] px-[18px] py-3.5 text-[13px] text-[#3A6B4C] font-semibold">
                  Waiting for {booking.doctorName} to start the call…
                </div>
              )}
            </>
          )}
        </div>

        {readyForCall && callJoined && (
          <ConsultRoom booking={booking} viewer="client" onLeave={() => setCallJoined(false)} />
        )}
      </div>
    </div>
  );
}
