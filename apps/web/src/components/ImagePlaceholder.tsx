type Props = {
  label: string;
  shape?: "rect" | "circle";
  className?: string;
  striped?: boolean;
};

export default function ImagePlaceholder({ label, shape = "rect", className = "", striped = false }: Props) {
  if (striped) {
    return (
      <div
        className={`flex items-center justify-center text-[#8A96A3] font-mono text-[9px] ${className}`}
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #EDEFF1, #EDEFF1 8px, #E4E7EA 8px, #E4E7EA 16px)",
        }}
      >
        {label}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-1.5 bg-[#EDEFF1] text-[#8A96A3] ${
        shape === "circle" ? "rounded-full" : ""
      } ${className}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="opacity-70">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M21 15l-5-5-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-[10px] text-center leading-tight px-2">{label}</span>
    </div>
  );
}
