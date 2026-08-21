"use client";

import { isValidEmail } from "@/lib/email-format";

export default function EmailInput({
  value,
  onChange,
  placeholder = "abc@abc.com",
  className = "mb-3",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const invalid = value.trim().length > 0 && !isValidEmail(value);

  return (
    <div className={className}>
      <input
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-lg border text-[13px] box-border"
        style={{ borderColor: invalid ? "#D64545" : "#E4E9EC" }}
      />
      {invalid && <div className="text-[11px] text-[#D64545] mt-1">Enter a valid email like abc@abc.com</div>}
    </div>
  );
}
