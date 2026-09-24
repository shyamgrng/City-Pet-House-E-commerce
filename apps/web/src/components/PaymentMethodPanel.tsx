"use client";

import { useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import MediaSlot from "@/components/MediaSlot";
import { formatRs } from "@/lib/catalog-types";
import { useFonepayPayment } from "@/lib/use-fonepay-payment";
import type { PaymentMethod } from "@/lib/payment-methods-types";

export default function PaymentMethodPanel({
  methods,
  amount,
  reference,
  remarks1,
  remarks2,
  selectedKey,
  onSelect,
  onFonepayVerifiedChange,
}: {
  methods: PaymentMethod[];
  amount: number;
  reference: string;
  remarks1: string;
  remarks2: string;
  selectedKey: string;
  onSelect: (key: string) => void;
  onFonepayVerifiedChange?: (verified: boolean, prn: string | null) => void;
}) {
  const selected = methods.find((m) => m.key === selectedKey) ?? methods[0];

  return (
    <div>
      {methods.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-4">
          {methods.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => onSelect(m.key)}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold border cursor-pointer"
              style={
                selected?.key === m.key
                  ? { background: "#1996C8", borderColor: "#1996C8", color: "#fff" }
                  : { background: "#fff", borderColor: "#E4E9EC", color: "#3A4652" }
              }
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      {selected?.kind === "dynamic-qr" && (
        <FonepayPanel
          method={selected}
          amount={amount}
          reference={reference}
          remarks1={remarks1}
          remarks2={remarks2}
          onVerifiedChange={onFonepayVerifiedChange}
        />
      )}
      {selected?.kind === "static-qr" && <StaticQrPanel method={selected} amount={amount} />}
      {selected?.kind === "bank" && <BankPanel method={selected} amount={amount} />}
      {!selected && <div className="text-xs text-[#8A96A3] text-center py-4">No payment method is available right now.</div>}
    </div>
  );
}

function FonepayPanel({
  method,
  amount,
  reference,
  remarks1,
  remarks2,
  onVerifiedChange,
}: {
  method: PaymentMethod;
  amount: number;
  reference: string;
  remarks1: string;
  remarks2: string;
  onVerifiedChange?: (verified: boolean, prn: string | null) => void;
}) {
  const { qrMessage, loading, error, verified } = useFonepayPayment(reference, amount, remarks1, remarks2, true);

  useEffect(() => {
    onVerifiedChange?.(verified, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verified]);

  return (
    <div className="text-center">
      <div className="text-xs text-[#8A96A3] mb-1">Scan with any {method.label}-connected banking app</div>
      <div className="font-heading font-bold text-2xl text-[#1A2027] mb-4">Pay exactly {formatRs(amount)}</div>

      {loading && <div className="w-[200px] h-[200px] mx-auto mb-3 rounded-lg bg-[#F7F9FA] flex items-center justify-center text-xs text-[#8A96A3]">Loading QR…</div>}
      {error && (
        <div className="w-[200px] mx-auto mb-3 rounded-lg bg-[#FDEDEC] border border-[#F3C6C2] text-[#D64545] text-xs p-4">{error}</div>
      )}
      {qrMessage && !loading && !error && (
        <div className="inline-block p-3 bg-white border border-[#E4E9EC] rounded-xl mb-3">
          <QRCodeSVG value={qrMessage} size={200} />
        </div>
      )}

      {verified ? (
        <div className="inline-block text-[11px] font-semibold text-[#1F7A4D] bg-[#E7F3EC] rounded-full px-3 py-1.5">
          ✓ Payment received via Fonepay
        </div>
      ) : (
        <div className="text-[11px] text-[#8A96A3]">We&apos;ll detect your payment automatically once it goes through.</div>
      )}
    </div>
  );
}

function StaticQrPanel({ method, amount }: { method: PaymentMethod; amount: number }) {
  return (
    <div className="text-center">
      <div className="font-heading font-bold text-2xl text-[#1A2027] mb-4">Pay exactly {formatRs(amount)}</div>
      <div className="w-[180px] h-[180px] mx-auto mb-2 rounded-lg bg-[#F7F9FA] overflow-hidden">
        <MediaSlot src={method.qrImage} label={`${method.label} QR`} className="w-full h-full text-[9px] font-mono" />
      </div>
      <div className="text-[11px] font-semibold text-[#1A2027]">{method.label}</div>
    </div>
  );
}

function BankPanel({ method, amount }: { method: PaymentMethod; amount: number }) {
  return (
    <div className="max-w-[320px] mx-auto">
      <div className="font-heading font-bold text-2xl text-[#1A2027] mb-4 text-center">Transfer exactly {formatRs(amount)}</div>
      <div className="bg-[#F7F9FA] border border-[#E4E9EC] rounded-lg p-4 text-left">
        <BankRow label="Bank" value={method.bankName} />
        <BankRow label="Account Name" value={method.accountName} />
        <BankRow label="Account Number" value={method.accountNumber} />
      </div>
    </div>
  );
}

function BankRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-[#E4E9EC] last:border-0">
      <span className="text-xs text-[#8A96A3]">{label}</span>
      <span className="text-[13px] font-semibold text-[#1A2027]">{value || "—"}</span>
    </div>
  );
}
