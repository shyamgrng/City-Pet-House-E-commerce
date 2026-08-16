export interface TestimonialData {
  id: string;
  author: string;
  quote: string;
}

export function TestimonialCard({ testimonial }: { testimonial: TestimonialData }) {
  return (
    <div className="rounded-card border border-border bg-white p-5">
      <p className="mb-3 text-[13px] leading-relaxed text-text-secondary">&ldquo;{testimonial.quote}&rdquo;</p>
      <p className="text-[13px] font-semibold text-text-dark">{testimonial.author}</p>
    </div>
  );
}
