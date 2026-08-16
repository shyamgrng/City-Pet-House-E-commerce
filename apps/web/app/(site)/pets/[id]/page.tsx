import { notFound } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { formatNPR } from "@cph/shared-types";
import { PetCard, PetCardData } from "@/components/PetCard";
import { Rail } from "@/components/Rail";

interface PetDetail extends PetCardData {
  deliveryFee: number;
}

export default async function PetDetailPage({ params }: { params: { id: string } }) {
  let pet: PetDetail;
  try {
    pet = await apiFetch<PetDetail>(`/pets/${params.id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  const similar = await apiFetch<PetCardData[]>(`/pets/${params.id}/similar`).catch(() => []);

  return (
    <div>
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-8 md:grid-cols-2">
        <div className="flex aspect-square items-center justify-center rounded-card border border-border bg-bg-surface">
          {pet.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pet.images[0]} alt={pet.breed} className="h-full w-full rounded-card object-cover" />
          ) : (
            <span className="text-[13px] text-text-muted">Photo coming soon</span>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-[22px]">{pet.breed}</h1>
          <span className="text-[13px] text-text-muted">
            {pet.species} &middot; {pet.sex} &middot; {pet.age}
          </span>
          <div className="flex flex-wrap gap-1">
            {pet.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                {tag}
              </span>
            ))}
          </div>
          <span className="font-heading text-[26px] font-bold text-text-dark">{formatNPR(pet.price)}</span>
          <p className="text-[13px] text-text-secondary">Delivery fee: {formatNPR(pet.deliveryFee)}</p>
          <a
            href="tel:+9779851313717"
            className="mt-2 inline-block w-fit rounded-control bg-primary px-5 py-2.5 text-[13px] font-semibold text-white hover:opacity-90"
          >
            Call to Enquire &middot; +977 9851313717
          </a>
        </div>
      </div>

      {similar.length > 0 && (
        <Rail title="Similar Pets">
          {similar.map((p) => (
            <PetCard key={p.id} pet={p} />
          ))}
        </Rail>
      )}
    </div>
  );
}
