"use client";

import { createContext, useContext } from "react";
import { dogBreedSeed } from "@/lib/dog-breed-seed";
import type { DogBreed } from "@/lib/dog-breed-types";
import { useSiteContentStore } from "@/lib/site-content-store";

const STORAGE_KEY = "cph_dog_breeds";

type DogBreedValue = {
  breeds: DogBreed[];
  ready: boolean;
  addBreed: (input: Omit<DogBreed, "id">) => void;
  updateBreed: (id: string, input: Omit<DogBreed, "id">) => void;
  removeBreed: (id: string) => void;
};

const DogBreedContext = createContext<DogBreedValue | null>(null);

export function DogBreedProvider({ children }: { children: React.ReactNode }) {
  const { data: breeds, ready, update: persist } = useSiteContentStore<DogBreed[]>(STORAGE_KEY, dogBreedSeed);

  return (
    <DogBreedContext.Provider
      value={{
        breeds,
        ready,
        addBreed: (input) => persist([{ id: "breed-" + Date.now(), ...input }, ...breeds]),
        updateBreed: (id, input) => persist(breeds.map((b) => (b.id === id ? { id, ...input } : b))),
        removeBreed: (id) => persist(breeds.filter((b) => b.id !== id)),
      }}
    >
      {children}
    </DogBreedContext.Provider>
  );
}

export function useDogBreeds() {
  const ctx = useContext(DogBreedContext);
  if (!ctx) throw new Error("useDogBreeds must be used within DogBreedProvider");
  return ctx;
}
