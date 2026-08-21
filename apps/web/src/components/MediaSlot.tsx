import ImagePlaceholder from "./ImagePlaceholder";

export default function MediaSlot({
  src,
  label,
  shape = "rect",
  className = "",
}: {
  src?: string;
  label: string;
  shape?: "rect" | "circle";
  className?: string;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded data: URLs, not optimizable by next/image
    return <img src={src} alt={label} className={`object-cover ${shape === "circle" ? "rounded-full" : ""} ${className}`} />;
  }
  return <ImagePlaceholder label={label} shape={shape} className={className} />;
}
