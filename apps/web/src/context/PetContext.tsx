"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { petSeed } from "@/lib/pet-seed";
import type { Pet } from "@/lib/pet-types";
import { dewormStages, PET_PHOTO_SLOTS, slugify, vaccineStages } from "@/lib/pet-types";

const STORAGE_KEY = "cph_pets";

// Backfills fields introduced after this record may have been saved to localStorage by an
// older build. Older records carried a single `photo` string and a `videos` count instead of
// a photos[] array with a chosen cover slot and a real uploaded `video`, and had no
// vaccination/deworming checklist at all.
function normalizePet(p: Partial<Pet> & Pick<Pet, "id" | "breed"> & { photo?: string }): Pet {
  const photos = Array.isArray(p.photos)
    ? [...p.photos, ...Array(PET_PHOTO_SLOTS).fill("")].slice(0, PET_PHOTO_SLOTS)
    : [p.photo || "", ...Array(PET_PHOTO_SLOTS - 1).fill("")];
  const photoAlts = Array.isArray(p.photoAlts)
    ? [...p.photoAlts, ...Array(PET_PHOTO_SLOTS).fill("")].slice(0, PET_PHOTO_SLOTS)
    : Array(PET_PHOTO_SLOTS).fill("");
  const vaccinations = Array.isArray(p.vaccinations)
    ? [...p.vaccinations, ...Array(vaccineStages.length).fill(false)].slice(0, vaccineStages.length)
    : Array(vaccineStages.length).fill(false);
  const dewormings = Array.isArray(p.dewormings)
    ? [...p.dewormings, ...Array(dewormStages.length).fill(false)].slice(0, dewormStages.length)
    : Array(dewormStages.length).fill(false);
  return {
    species: "Dog",
    sex: "Male",
    age: "",
    price: 0,
    deliveryFee: 0,
    tags: [],
    status: "Available",
    coverPhotoIndex: 0,
    video: "",
    ...p,
    photos,
    photoAlts,
    vaccinations,
    dewormings,
  };
}

type PetValue = {
  pets: Pet[];
  ready: boolean;
  saveError: string | null;
  addPet: (input: Omit<Pet, "id">) => string;
  updatePet: (id: string, input: Omit<Pet, "id">) => boolean;
  deletePet: (id: string) => void;
};

const PetContext = createContext<PetValue | null>(null);

function loadStored(): Pet[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return petSeed;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed.map(normalizePet) : petSeed;
  } catch {
    return petSeed;
  }
}

export function PetProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ pets: Pet[]; ready: boolean; saveError: string | null }>({
    pets: petSeed,
    ready: false,
    saveError: null,
  });

  useEffect(() => {
    // One-time hydration from localStorage on mount — no external event to subscribe to.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ pets: loadStored(), ready: true, saveError: null });
  }, []);

  // Photos and video are stored as base64 data URLs — a large upload can exceed the
  // browser's localStorage quota, so surface that instead of silently dropping the edit.
  const persist = (pets: Pet[]): boolean => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
    } catch {
      setState((s) => ({ ...s, saveError: "Couldn't save — your browser's storage is full. Try a smaller photo/video, or delete an old pet, then try again." }));
      return false;
    }
    setState({ pets, ready: true, saveError: null });
    return true;
  };

  const addPet = (input: Omit<Pet, "id">) => {
    const id = slugify(input.breed) + "-" + Math.random().toString(36).slice(2, 7);
    persist([{ ...input, id }, ...state.pets]);
    return id;
  };

  const updatePet = (id: string, input: Omit<Pet, "id">) => {
    return persist(state.pets.map((p) => (p.id === id ? { ...input, id } : p)));
  };

  const deletePet = (id: string) => {
    persist(state.pets.filter((p) => p.id !== id));
  };

  return (
    <PetContext.Provider value={{ pets: state.pets, ready: state.ready, saveError: state.saveError, addPet, updatePet, deletePet }}>
      {children}
    </PetContext.Provider>
  );
}

export function usePets() {
  const ctx = useContext(PetContext);
  if (!ctx) throw new Error("usePets must be used within PetProvider");
  return ctx;
}
