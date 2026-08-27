"use client";

import { use, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useVet } from "@/context/VetContext";
import { IMAGE_ACCEPT, isAllowedImageFile, resizeImageFile } from "@/lib/image-upload";

export default function VetPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { bookings, submitPayment } = useVet();
  const booking = bookings.find((b) => b.id === id);
  const [receiptPhoto, setReceiptPhoto] = useState("");
  const [receiptUploading, setReceiptUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  if (!booking) {
    return (
      <div className="px-8 py-10 text-center text-sm text-[#8A96A3]">
        Booking not found. <Link href="/vet" className="text-primary font-semibold">Back to Web Vet</Link>
      </div>
    );
  }

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    if (!isAllowedImageFile(file)) {
      setError("Please choose an image file (JPEG, PNG, GIF, SVG, TIFF, or RAW).");
      return;
    }
    setReceiptUploading(true);
    try {
      const dataUrl = await resizeImageFile(file, 1000, 1400);
      setReceiptPhoto(dataUrl);
    } catch {
      setError("Could not process that image — try a different file.");
    } finally {
      setReceiptUploading(false);
    }
  };

  const submit = () => {
    if (!receiptPhoto) {
      setError("Please upload your payment receipt to continue.");
      return;
    }
    const ok = submitPayment(booking.id, receiptPhoto);
    if (!ok) {
      setError("Couldn't save — your browser's storage is full. Delete an old photo or video somewhere on the site to free up space, then try again.");
      return;
    }
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
        <input ref={fileRef} type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
        {receiptPhoto ? (
          <div className="mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={receiptPhoto} alt="payment receipt" className="w-full max-h-[220px] object-contain rounded-lg border border-[#E4E9EC] mb-2" />
            <button onClick={() => fileRef.current?.click()} className="text-xs font-semibold text-primary cursor-pointer">
              Replace
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={receiptUploading}
            className="w-full h-[150px] mb-4 rounded-lg border-2 border-dashed border-[#E4E9EC] flex items-center justify-center text-xs text-[#8A96A3] cursor-pointer"
          >
            {receiptUploading ? "Processing photo…" : "Drop your payment screenshot"}
          </button>
        )}

        {error && <div className="text-xs text-[#D64545] mb-2.5">{error}</div>}
        <button onClick={submit} className="w-full bg-primary text-white text-center py-3.5 rounded-[9px] text-sm font-semibold cursor-pointer">
          Submit for Approval
        </button>
      </div>
    </div>
  );
}
