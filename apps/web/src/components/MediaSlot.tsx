import ImagePlaceholder from "./ImagePlaceholder";

export default function MediaSlot({
  src,
  label,
  shape = "rect",
  className = "",
  striped = false,
}: {
  src?: string;
  label: string;
  shape?: "rect" | "circle";
  className?: string;
  striped?: boolean;
}) {
  if (src) {
    return (
      <div className={`bg-[#EDEFF1] flex items-center justify-center overflow-hidden ${shape === "circle" ? "rounded-full" : ""} ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded data: URLs, not optimizable by next/image */}
        <img src={src} alt={label} className="max-w-full max-h-full object-contain" />
      </div>
    );
  }
  return <ImagePlaceholder label={label} shape={shape} className={className} striped={striped} />;
}
