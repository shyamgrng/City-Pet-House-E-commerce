"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { dogBreedSeed } from "@/lib/dog-breed-seed";
import type { DogBreed } from "@/lib/dog-breed-types";

const STORAGE_KEY = "cph_dog_breeds";

type DogBreedValue = {
  breeds: DogBreed[];
  ready: boolean;
  addBreed: (input: Omit<DogBreed, "id">) => void;
  updateBreed: (id: string, input: Omit<DogBreed, "id">) => void;
  removeBreed: (id: string) => void;
};

const DogBreedContext = createContext<DogBreedValue | null>(null);

function loadStored(): DogBreed[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as DogBreed[]) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : dogBreedSeed;
  } catch {
    return dogBreedSeed;
  }
}

export function DogBreedProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ breeds: DogBreed[]; ready: boolean }>({ breeds: dogBreedSeed, ready: false });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ breeds: loadStored(), ready: true });
  }, []);

  const persist = (breeds: DogBreed[]) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(breeds));
    setState({ breeds, ready: true });
  };

  return (
    <DogBreedContext.Provider
      value={{
        breeds: state.breeds,
        ready: state.ready,
        addBreed: (input) => persist([{ id: "breed-" + Date.now(), ...input }, ...state.breeds]),
        updateBreed: (id, input) => persist(state.breeds.map((b) => (b.id === id ? { id, ...input } : b))),
        removeBreed: (id) => persist(state.breeds.filter((b) => b.id !== id)),
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
