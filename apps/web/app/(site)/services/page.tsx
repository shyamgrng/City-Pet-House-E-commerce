import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface ServiceCardData {
  id: string;
  name: string;
  shortDesc: string;
  photo: string | null;
}

async function getServices() {
  return apiFetch<ServiceCardData[]>("/services").catch(() => []);
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="mb-2 text-[22px]">Our Services</h1>
      <p className="mb-6 text-[13px] text-text-secondary">
        Complete pet care under one roof — from routine checkups to emergency treatment.
      </p>

      {services.length === 0 ? (
        <p className="py-16 text-center text-[14px] text-text-muted">No services are listed right now.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => (
            <div key={svc.id} className="overflow-hidden rounded-card border border-border bg-white">
              <Link href={`/services/${svc.id}`} className="block h-[190px] bg-bg-surface">
                {svc.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={svc.photo} alt={svc.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[12px] text-text-muted">
                    Photo coming soon
                  </div>
                )}
              </Link>
              <div className="p-5">
                <Link href={`/services/${svc.id}`} className="mb-2 block font-heading text-[16px] font-bold text-text-dark hover:text-primary">
                  {svc.name}
                </Link>
                <p className="mb-4 text-[13px] leading-relaxed text-text-secondary">{svc.shortDesc}</p>
                <Link
                  href={`/services/${svc.id}`}
                  className="mb-2 block rounded-control border border-primary py-2 text-center text-[13px] font-semibold text-primary"
                >
                  View Details
                </Link>
                <a
                  href="tel:+9779851313717"
                  className="block rounded-control bg-primary py-2.5 text-center text-[13px] font-semibold text-white"
                >
                  Book Now
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
