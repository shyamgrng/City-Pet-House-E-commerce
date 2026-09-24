"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PaymentMethodPanel from "@/components/PaymentMethodPanel";
import { usePaymentMethods } from "@/context/PaymentMethodsContext";
import { useVet } from "@/context/VetContext";

export default function VetPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { bookings, submitPayment } = useVet();
  const { methods } = usePaymentMethods();
  const activeMethods = methods.filter((m) => m.active);
  const booking = bookings.find((b) => b.id === id);
  const [selectedMethodKey, setSelectedMethodKey] = useState(activeMethods[0]?.key ?? "");
  const [fonepayVerified, setFonepayVerified] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (activeMethods.length > 0 && !activeMethods.some((m) => m.key === selectedMethodKey)) {
      setSelectedMethodKey(activeMethods[0].key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMethods]);

  if (!booking) {
    return (
      <div className="px-4 md:px-8 py-10 text-center text-sm text-[#8A96A3]">
        Booking not found. <Link href="/vet" className="text-primary font-semibold">Back to Web Vet</Link>
      </div>
    );
  }

  const submit = () => {
    if (!selectedMethodKey) {
      setError("Please choose a payment method.");
      return;
    }
    const ok = submitPayment(booking.id, selectedMethodKey, fonepayVerified);
    if (!ok) {
      setError("Couldn't save — check your internet connection and try again.");
      return;
    }
    router.push(`/vet/status/${booking.id}`);
  };

  return (
    <div className="px-4 md:px-8 py-7 flex justify-center">
      <div className="max-w-[480px] w-full">
        <Link href={`/vet/book?doctor=${booking.doctorId}`} className="text-[13px] text-primary font-semibold mb-4 inline-block">
          ← Back
        </Link>
        <div className="font-heading font-bold text-xl text-[#1A2027] mb-1.5 text-center">Consult Fee Payment</div>
        <div className="text-[13px] text-[#5B6773] mb-5 text-center">
          Choose how you&apos;d like to pay, then confirm below once you&apos;ve sent the payment. Your booking is held pending admin
          approval.
        </div>

        <div className="bg-[#F7F9FA] border border-[#E4E9EC] rounded-xl p-5 mb-4">
          <PaymentMethodPanel
            methods={activeMethods}
            amount={booking.amount}
            reference={`vet-${booking.id}`}
            remarks1="City Pet House"
            remarks2="Vet Consult"
            selectedKey={selectedMethodKey}
            onSelect={setSelectedMethodKey}
            onFonepayVerifiedChange={setFonepayVerified}
          />
        </div>

        {error && <div className="text-xs text-[#D64545] mb-2.5">{error}</div>}
        <button onClick={submit} className="w-full bg-primary text-white text-center py-3.5 rounded-[9px] text-sm font-semibold cursor-pointer">
          I&apos;ve Paid — Submit for Approval
        </button>
      </div>
    </div>
  );
}
