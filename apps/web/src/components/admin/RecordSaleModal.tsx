"use client";

import { useState } from "react";
import { IMAGE_ACCEPT, isAllowedImageFile, resizeImageFile } from "@/lib/image-upload";

export type PetSaleInput = { saleAmount: number; buyerName: string; buyerPhone: string; saleReceiptPhoto: string };

/** Shown before a pet's status can be set to "Sold" — from either the pet-card editor or the
 * Pet Available overview's quick "Mark Sold" action — so every sale feeds the Finance ledger's
 * pet sales income with a receipt on file. */
export default function RecordSaleModal({
  defaultAmount,
  onCancel,
  onConfirm,
}: {
  defaultAmount: number;
  onCancel: () => void;
  onConfirm: (sale: PetSaleInput) => void;
}) {
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [saleAmount, setSaleAmount] = useState(defaultAmount);
  const [saleReceiptPhoto, setSaleReceiptPhoto] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleReceipt = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    if (!isAllowedImageFile(file)) {
      setError("Please choose an image file (JPEG, PNG, GIF, SVG, TIFF, or RAW).");
      return;
    }
    setUploading(true);
    try {
      setSaleReceiptPhoto(await resizeImageFile(file, 1000, 1400));
    } catch {
      setError("Could not process that image — try a different file.");
    } finally {
      setUploading(false);
    }
  };

  const submit = () => {
    if (!buyerName.trim() || !buyerPhone.trim()) {
      setError("Please fill in the buyer's name and phone.");
      return;
    }
    if (!(saleAmount > 0)) {
      setError("Enter a valid sale amount.");
      return;
    }
    if (!saleReceiptPhoto) {
      setError("Please upload the payment receipt to record this sale.");
      return;
    }
    onConfirm({ saleAmount, buyerName: buyerName.trim(), buyerPhone: buyerPhone.trim(), saleReceiptPhoto });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" onClick={onCancel}>
      <div className="bg-white rounded-xl p-5 w-full max-w-[380px]" onClick={(e) => e.stopPropagation()}>
        <div className="text-sm font-bold text-[#1A2027] mb-1">Record This Sale</div>
        <div className="text-[11px] text-[#5B6773] mb-4">This feeds the Finance ledger&apos;s pet sales income — required before marking Sold.</div>

        <Field label="Buyer Name">
          <input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} className={inputCls} />
        </Field>
        <div className="h-2.5" />
        <Field label="Buyer Phone">
          <input value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} className={inputCls} />
        </Field>
        <div className="h-2.5" />
        <Field label="Sale Amount (Rs.)">
          <input
            value={String(saleAmount)}
            onChange={(e) => setSaleAmount(Number(e.target.value.replace(/[^\d]/g, "")) || 0)}
            className={inputCls}
          />
        </Field>
        <div className="h-2.5" />
        <Field label="Payment Receipt">
          <input type="file" accept={IMAGE_ACCEPT} onChange={(e) => handleReceipt(e.target.files?.[0])} className="text-[11px]" />
        </Field>
        {uploading && <div className="text-[11px] text-[#8A96A3] mt-1">Processing photo…</div>}
        {saleReceiptPhoto && !uploading && <div className="text-[11px] text-[#1F7A4D] font-semibold mt-1">✓ Receipt attached</div>}
        {error && <div className="text-[11px] text-[#D64545] mt-2">{error}</div>}

        <div className="flex gap-2 mt-4">
          <button onClick={onCancel} className="flex-1 border border-[#E4E9EC] text-[#3A4652] text-xs font-semibold py-2 rounded-lg cursor-pointer">
            Cancel
          </button>
          <button onClick={submit} className="flex-1 bg-primary text-white text-xs font-semibold py-2 rounded-lg cursor-pointer">
            Confirm Sale
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full box-border h-8 rounded-md border border-[#E4E9EC] px-2.5 text-xs bg-white";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11px] font-semibold text-[#5B6773] mb-1">{label}</div>
      {children}
    </label>
  );
}
