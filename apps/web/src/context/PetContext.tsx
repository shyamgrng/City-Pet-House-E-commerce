"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { petSeed } from "@/lib/pet-seed";
import type { Pet } from "@/lib/pet-types";
import { slugify } from "@/lib/pet-types";

const STORAGE_KEY = "cph_pets";

type PetValue = {
  pets: Pet[];
  ready: boolean;
  addPet: (input: Omit<Pet, "id">) => void;
  updatePet: (id: string, input: Omit<Pet, "id">) => void;
  deletePet: (id: string) => void;
};

const PetContext = createContext<PetValue | null>(null);

function loadStored(): Pet[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return petSeed;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : petSeed;
  } catch {
    return petSeed;
  }
}

export function PetProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ pets: Pet[]; ready: boolean }>({ pets: petSeed, ready: false });

  useEffect(() => {
    // One-time hydration from localStorage on mount — no external event to subscribe to.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ pets: loadStored(), ready: true });
  }, []);

  const persist = (pets: Pet[]) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
    setState({ pets, ready: true });
  };

  const addPet = (input: Omit<Pet, "id">) => {
    const id = slugify(input.breed) + "-" + Math.random().toString(36).slice(2, 7);
    persist([{ ...input, id }, ...state.pets]);
  };

  const updatePet = (id: string, input: Omit<Pet, "id">) => {
    persist(state.pets.map((p) => (p.id === id ? { ...input, id } : p)));
  };

  const deletePet = (id: string) => {
    persist(state.pets.filter((p) => p.id !== id));
  };

  return (
    <PetContext.Provider value={{ pets: state.pets, ready: state.ready, addPet, updatePet, deletePet }}>
      {children}
    </PetContext.Provider>
  );
}

export function usePets() {
  const ctx = useContext(PetContext);
  if (!ctx) throw new Error("usePets must be used within PetProvider");
  return ctx;
}
