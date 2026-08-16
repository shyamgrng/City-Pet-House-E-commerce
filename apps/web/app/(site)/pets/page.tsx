import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { PetCard, PetCardData } from "@/components/PetCard";

const SPECIES = ["All", "Dog", "Cat", "Small Pets", "Birds", "Fish"];

export default async function PetsPage({ searchParams }: { searchParams: { species?: string } }) {
  const species = searchParams.species ?? "All";
  const pets = await apiFetch<PetCardData[]>(`/pets${species !== "All" ? `?species=${encodeURIComponent(species)}` : ""}`).catch(
    () => [],
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="mb-6 text-[22px]">Pets Available</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {SPECIES.map((s) => (
          <Link
            key={s}
            href={`/pets${s !== "All" ? `?species=${encodeURIComponent(s)}` : ""}`}
            className={`rounded-full px-4 py-1.5 text-[12px] font-medium ${
              species === s ? "bg-primary text-white" : "border border-border bg-white text-text-secondary hover:border-primary"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {pets.length === 0 ? (
        <p className="py-16 text-center text-[14px] text-text-muted">No pets listed in this category right now.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      )}
    </div>
  );
}
