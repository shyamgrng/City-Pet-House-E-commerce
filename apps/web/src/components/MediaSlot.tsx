import ImagePlaceholder from "./ImagePlaceholder";

export default function MediaSlot({
  src,
  label,
  shape = "rect",
  className = "",
  striped = false,
  fit = "contain",
  hoverZoom = false,
}: {
  src?: string;
  label: string;
  shape?: "rect" | "circle";
  className?: string;
  striped?: boolean;
  /** "contain" (default) shows the whole photo uncropped, letterboxed on white -- right for product/pet photos.
   *  "cover" fills the box edge-to-edge, cropping as needed -- right for full-bleed hero/banner backgrounds. */
  fit?: "contain" | "cover";
  /** Gently scales the photo up on hover, clipped by this slot's own bounds -- for clickable cards. */
  hoverZoom?: boolean;
}) {
  if (src) {
    // Callers that pass their own `absolute` positioning class (e.g. hero/banner slots) must not
    // also get our default `relative` here -- having both on one element makes `position` depend on
    // unstable CSS cascade order, which can resolve differently across browsers/builds and silently
    // pushes this box (and anything stacked after it) out of its clipped container.
    const selfPositioned = /(^|\s)(absolute|fixed|sticky)(\s|$)/.test(className);
    return (
      <div className={`${selfPositioned ? "" : "relative"} ${fit === "contain" ? "bg-white" : ""} overflow-hidden ${shape === "circle" ? "rounded-full" : ""} ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded data: URLs, not optimizable by next/image */}
        <img
          src={src}
          alt={label}
          className={`absolute inset-0 w-full h-full ${fit === "contain" ? "object-contain" : "object-cover"} ${hoverZoom ? "transition-transform duration-300 hover:scale-110" : ""}`}
        />
      </div>
    );
  }
  return <ImagePlaceholder label={label} shape={shape} className={className} striped={striped} />;
}
