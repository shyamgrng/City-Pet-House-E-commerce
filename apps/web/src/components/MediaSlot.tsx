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
      <div className={`relative bg-[#EDEFF1] overflow-hidden ${shape === "circle" ? "rounded-full" : ""} ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded data: URLs, not optimizable by next/image */}
        <img
          src={src}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "blur(40px) saturate(1.3) brightness(0.92)", transform: "scale(1.6)" }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded data: URLs, not optimizable by next/image */}
        <img src={src} alt={label} className="absolute inset-0 w-full h-full object-contain" />
      </div>
    );
  }
  return <ImagePlaceholder label={label} shape={shape} className={className} striped={striped} />;
}
