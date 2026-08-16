interface PromoBannerProps {
  title: string;
  ctaLabel: string;
  ctaHref: string;
  height?: string;
  accent?: "primary" | "success";
}

export function PromoBanner({ title, ctaLabel, ctaHref, height = "110px", accent = "primary" }: PromoBannerProps) {
  const accentBg = accent === "success" ? "bg-success" : "bg-primary";

  return (
    <section className="mx-auto max-w-7xl px-6 py-4">
      <div
        className="relative flex items-center justify-between gap-6 overflow-hidden rounded-card bg-gradient-to-br from-text-dark to-[#3A4652] px-8"
        style={{ height }}
      >
        <span className="font-heading text-[18px] font-bold text-white sm:text-[20px]">{title}</span>
        <a
          href={ctaHref}
          className={`shrink-0 rounded-control ${accentBg} px-5 py-2.5 text-[13px] font-semibold text-white hover:opacity-90`}
        >
          {ctaLabel}
        </a>
      </div>
    </section>
  );
}
