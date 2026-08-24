import ImagePlaceholder from "./ImagePlaceholder";

export default function MediaSlot({
  src,
  label,
  shape = "rect",
  className = "",
  striped = false,
  fit = "contain",
}: {
  src?: string;
  label: string;
  shape?: "rect" | "circle";
  className?: string;
  striped?: boolean;
  /** "contain" (default) shows the whole photo uncropped, letterboxed on white -- right for product/pet photos.
   *  "cover" fills the box edge-to-edge, cropping as needed -- right for full-bleed hero/banner backgrounds. */
  fit?: "contain" | "cover";
}) {
  if (src) {
    return (
      <div className={`relative ${fit === "contain" ? "bg-white" : ""} overflow-hidden ${shape === "circle" ? "rounded-full" : ""} ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded data: URLs, not optimizable by next/image */}
        <img src={src} alt={label} className={`absolute inset-0 w-full h-full ${fit === "contain" ? "object-contain" : "object-cover"}`} />
      </div>
    );
  }
  return <ImagePlaceholder label={label} shape={shape} className={className} striped={striped} />;
}
