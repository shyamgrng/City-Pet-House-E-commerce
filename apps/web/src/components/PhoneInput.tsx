"use client";

import { phoneDigits, PHONE_PREFIX } from "@/lib/phone";

export default function PhoneInput({
  value,
  onChange,
  placeholder = "98XXXXXXXX",
  className = "mb-3",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const digits = phoneDigits(value);
  const invalid = digits.length > 0 && digits.length < 10;

  return (
    <div className={className}>
      <div className="flex gap-2">
        <div className="px-3 py-2.5 rounded-lg border border-[#E4E9EC] bg-[#F0F2F4] text-[13px] font-semibold text-[#3A4652] select-none shrink-0">
          +977
        </div>
        <input
          value={digits}
          onChange={(e) => {
            const next = e.target.value.replace(/\D/g, "").slice(0, 10);
            onChange(next ? `${PHONE_PREFIX}${next}` : "");
          }}
          inputMode="numeric"
          maxLength={10}
          placeholder={placeholder}
          className="flex-1 min-w-0 px-3 py-2.5 rounded-lg border text-[13px] box-border"
          style={{ borderColor: invalid ? "#D64545" : "#E4E9EC" }}
        />
      </div>
      {invalid && <div className="text-[11px] text-[#D64545] mt-1">Enter a 10-digit phone number</div>}
    </div>
  );
}
