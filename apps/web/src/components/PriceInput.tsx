"use client";

export default function PriceInput({
  value,
  onChange,
  placeholder = "0",
  className = "",
}: {
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`flex gap-2 ${className}`}>
      <div className="px-3 py-2.5 rounded-lg border border-[#E4E9EC] bg-[#F0F2F4] text-[13px] font-semibold text-[#3A4652] select-none shrink-0">
        Rs.
      </div>
      <input
        value={value > 0 ? String(value) : ""}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "");
          onChange(digits ? Number(digits) : 0);
        }}
        inputMode="numeric"
        placeholder={placeholder}
        className="flex-1 min-w-0 px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] box-border"
      />
    </div>
  );
}
