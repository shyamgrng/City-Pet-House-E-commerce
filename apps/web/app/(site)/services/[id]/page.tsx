import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";

interface ServiceDetail {
  id: string;
  name: string;
  seoTitle: string;
  longDesc: string;
  benefits: string[];
  duration: string | null;
  price: string | null;
  schedule: { age: string; vaccine: string }[] | null;
  photo: string | null;
}

async function getService(id: string) {
  try {
    return await apiFetch<ServiceDetail>(`/services/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export default async function ServiceDetailPage({ params }: { params: { id: string } }) {
  const service = await getService(params.id);
  if (!service) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Link href="/services" className="mb-4 inline-block text-[13px] font-semibold text-primary">
        ← Back to Services
      </Link>
      <p className="mb-4 text-[12px] text-text-muted">Home / Services / {service.name}</p>

      <div className="mb-5 h-[260px] overflow-hidden rounded-card bg-bg-surface">
        {service.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={service.photo} alt={service.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[12px] text-text-muted">Photo coming soon</div>
        )}
      </div>

      <h1 className="mb-3 font-heading text-[22px] font-bold leading-snug text-text-dark">{service.seoTitle}</h1>
      <p className="mb-5 text-[14px] leading-relaxed text-text-secondary">{service.longDesc}</p>

      <div className="mb-5 flex gap-6">
        {service.duration && (
          <div>
            <p className="mb-1 text-[11px] text-text-muted">Duration</p>
            <p className="text-[14px] font-semibold text-text-dark">{service.duration}</p>
          </div>
        )}
        {service.price && (
          <div>
            <p className="mb-1 text-[11px] text-text-muted">Price</p>
            <p className="text-[14px] font-semibold text-text-dark">{service.price}</p>
          </div>
        )}
      </div>

      {service.schedule && service.schedule.length > 0 && (
        <>
          <p className="mb-2 text-[14px] font-semibold text-text-dark">Vaccination Schedule</p>
          <div className="mb-5 overflow-hidden rounded-control border border-border">
            {service.schedule.map((row, i) => (
              <div key={i} className="flex border-b border-border px-3.5 py-3 text-[13px] last:border-0">
                <span className="w-40 shrink-0 font-semibold text-text-dark">{row.age}</span>
                <span className="text-text-secondary">{row.vaccine}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {service.benefits.length > 0 && (
        <>
          <p className="mb-2 text-[14px] font-semibold text-text-dark">Why Choose This Service</p>
          <ul className="mb-4 flex flex-col gap-2">
            {service.benefits.map((b) => (
              <li key={b} className="text-[13px] text-text-secondary">
                ✅ {b}
              </li>
            ))}
          </ul>
        </>
      )}

      <a
        href="tel:+9779851313717"
        className="mt-2 inline-block rounded-control bg-primary px-6 py-3 text-[14px] font-semibold text-white"
      >
        Book Now
      </a>
    </div>
  );
}
