"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useVet } from "@/context/VetContext";

export default function VetPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { bookings, submitPayment } = useVet();
  const booking = bookings.find((b) => b.id === id);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState("");

  if (!booking) {
    return (
      <div className="px-8 py-10 text-center text-sm text-[#8A96A3]">
        Booking not found. <Link href="/vet" className="text-primary font-semibold">Back to Web Vet</Link>
      </div>
    );
  }

  const submit = () => {
    if (!uploaded) {
      setError("Please upload your payment receipt to continue.");
      return;
    }
    submitPayment(booking.id);
    router.push(`/vet/status/${booking.id}`);
  };

  return (
    <div className="px-8 py-7 flex justify-center">
      <div className="max-w-[480px] w-full">
        <Link href={`/vet/book?doctor=${booking.doctorId}`} className="text-[13px] text-primary font-semibold mb-4 inline-block">
          ← Back
        </Link>
        <div className="font-heading font-bold text-xl text-[#1A2027] mb-1.5 text-center">Consult Fee Payment</div>
        <div className="text-[13px] text-[#5B6773] mb-5 text-center">
          Pay via any of the QR codes below, then upload your receipt screenshot. Your booking is held pending admin approval.
        </div>

        <div className="bg-[#F7F9FA] border border-[#E4E9EC] rounded-xl p-5 mb-4 text-center">
          <div className="text-xs text-[#8A96A3] mb-3">Consultation Fee</div>
          <div className="font-heading font-bold text-2xl text-[#1A2027] mb-4">Rs. {booking.amount}</div>
          <div className="flex gap-3 justify-center">
            {["eSewa", "Khalti", "Bank Transfer"].map((pm) => (
              <div key={pm} className="text-center">
                <div className="w-[100px] h-[100px] mb-1 rounded-lg bg-[#EDEFF1] flex items-center justify-center text-[9px] text-[#8A96A3] font-mono">
                  QR
                </div>
                <div className="text-[11px] font-semibold text-[#1A2027]">{pm}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs font-semibold text-[#3A4652] mb-1.5">
          Upload Payment Receipt <span className="text-[#D64545]">*</span>
        </div>
        <button
          onClick={() => setUploaded(true)}
          className="w-full h-[150px] mb-4 rounded-lg border-2 border-dashed border-[#E4E9EC] flex items-center justify-center text-xs cursor-pointer"
          style={{ color: uploaded ? "#1F7A4D" : "#8A96A3" }}
        >
          {uploaded ? "✓ receipt-screenshot.png uploaded" : "Drop your payment screenshot"}
        </button>

        {error && <div className="text-xs text-[#D64545] mb-2.5">{error}</div>}
        <button onClick={submit} className="w-full bg-primary text-white text-center py-3.5 rounded-[9px] text-sm font-semibold cursor-pointer">
          Submit for Approval
        </button>
      </div>
    </div>
  );
}
