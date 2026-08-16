import Link from "next/link";
import { formatNPR } from "@cph/shared-types";

export interface PetCardData {
  id: string;
  breed: string;
  species: string;
  sex: string;
  age: string;
  price: number;
  tags: string[];
  images: string[];
}

export function PetCard({ pet }: { pet: PetCardData }) {
  return (
    <Link
      href={`/pets/${pet.id}`}
      className="flex flex-col overflow-hidden rounded-card border border-border bg-white transition hover:shadow-floating"
    >
      <div className="flex aspect-square items-center justify-center bg-bg-surface">
        {pet.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pet.images[0]} alt={pet.breed} className="h-full w-full object-cover" />
        ) : (
          <span className="text-[12px] text-text-muted">Photo coming soon</span>
        )}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <span className="text-[13px] font-medium text-text-dark">{pet.breed}</span>
        <span className="text-[12px] text-text-muted">
          {pet.species} &middot; {pet.sex} &middot; {pet.age}
        </span>
        <div className="flex flex-wrap gap-1 pt-1">
          {pet.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
              {tag}
            </span>
          ))}
        </div>
        <span className="mt-1 font-heading text-[14px] font-bold text-text-dark">{formatNPR(pet.price)}</span>
      </div>
    </Link>
  );
}
