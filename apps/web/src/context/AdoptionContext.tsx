"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { adoptionSeed } from "@/lib/adoption-seed";
import type { AdoptionPost } from "@/lib/adoption-types";
import { slugify } from "@/lib/adoption-types";

const STORAGE_KEY = "cph_adoption_posts";

type AdoptionValue = {
  posts: AdoptionPost[];
  ready: boolean;
  addPost: (input: Omit<AdoptionPost, "id">) => void;
  updatePost: (id: string, input: Omit<AdoptionPost, "id">) => void;
  deletePost: (id: string) => void;
};

const AdoptionContext = createContext<AdoptionValue | null>(null);

function loadStored(): AdoptionPost[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return adoptionSeed;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : adoptionSeed;
  } catch {
    return adoptionSeed;
  }
}

export function AdoptionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ posts: AdoptionPost[]; ready: boolean }>({ posts: adoptionSeed, ready: false });

  useEffect(() => {
    // One-time hydration from localStorage on mount — no external event to subscribe to.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ posts: loadStored(), ready: true });
  }, []);

  const persist = (posts: AdoptionPost[]) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    setState({ posts, ready: true });
  };

  const addPost = (input: Omit<AdoptionPost, "id">) => {
    const id = slugify(input.name) + "-" + Math.random().toString(36).slice(2, 7);
    persist([{ ...input, id }, ...state.posts]);
  };

  const updatePost = (id: string, input: Omit<AdoptionPost, "id">) => {
    persist(state.posts.map((p) => (p.id === id ? { ...input, id } : p)));
  };

  const deletePost = (id: string) => {
    persist(state.posts.filter((p) => p.id !== id));
  };

  return (
    <AdoptionContext.Provider value={{ posts: state.posts, ready: state.ready, addPost, updatePost, deletePost }}>
      {children}
    </AdoptionContext.Provider>
  );
}

export function useAdoption() {
  const ctx = useContext(AdoptionContext);
  if (!ctx) throw new Error("useAdoption must be used within AdoptionProvider");
  return ctx;
}
