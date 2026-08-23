"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { parseLegacyAge } from "@/lib/pet-age";
import { petTagContentSeed, petTagSeed } from "@/lib/pet-tag-seed";
import type { PetTag, PetTagPageContent } from "@/lib/pet-tag-types";

const TAGS_KEY = "cph_pet_tags";
const CONTENT_KEY = "cph_pet_tag_content";

// Backfills fields introduced after this record may have been saved to localStorage by an
// older build, so previously-saved pet tags don't crash the new age-calculation UI. Records
// saved before ageYears/ageMonths existed carried a free-text `age` string instead — parse
// that into the new fields (as-of today) rather than resetting the pet to "Newborn".
function normalizeTag(t: Partial<PetTag> & Pick<PetTag, "id" | "tagId"> & { age?: string }): PetTag {
  const legacy = t.ageYears === undefined && t.ageMonths === undefined && t.age ? parseLegacyAge(t.age) : null;
  return {
    petName: "",
    photo: "",
    sex: "Male",
    ageYears: legacy?.years ?? 0,
    ageMonths: legacy?.months ?? 0,
    registeredDate: new Date().toISOString().slice(0, 10),
    breed: "",
    color: "",
    microchip: "",
    notes: "",
    ownerName: "",
    phone: "",
    altPhone: "",
    address: "",
    mapLink: "",
    scans: 0,
    ...t,
  };
}

type PetTagValue = {
  tags: PetTag[];
  content: PetTagPageContent;
  ready: boolean;
  saveError: string | null;
  addTag: (input: Omit<PetTag, "id" | "tagId" | "scans">) => boolean;
  updateTag: (id: string, patch: Partial<Omit<PetTag, "id" | "tagId" | "scans">>) => boolean;
  removeTag: (id: string) => void;
  lookupTag: (query: string) => PetTag | null;
  recordScan: (id: string) => void;
  setBannerTitle: (v: string) => void;
  setBannerSubtitle: (v: string) => void;
  setSearchCaption: (v: string) => void;
  updateSection: (id: string, patch: { heading?: string; body?: string }) => void;
  addFaq: () => void;
  updateFaq: (id: string, patch: { q?: string; a?: string }) => void;
  removeFaq: (id: string) => void;
};

const PetTagContext = createContext<PetTagValue | null>(null);

function loadTags(): PetTag[] {
  const raw = window.localStorage.getItem(TAGS_KEY);
  if (!raw) return petTagSeed;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed.map(normalizeTag) : petTagSeed;
  } catch {
    return petTagSeed;
  }
}

function loadContent(): PetTagPageContent {
  const raw = window.localStorage.getItem(CONTENT_KEY);
  if (!raw) return petTagContentSeed;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : petTagContentSeed;
  } catch {
    return petTagContentSeed;
  }
}

export function PetTagProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ tags: PetTag[]; content: PetTagPageContent; ready: boolean; saveError: string | null }>({
    tags: petTagSeed,
    content: petTagContentSeed,
    ready: false,
    saveError: null,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ tags: loadTags(), content: loadContent(), ready: true, saveError: null });
  }, []);

  // Saving a large photo can exceed the browser's localStorage quota — surface that instead
  // of silently discarding the edit, so "I uploaded a photo but it's not there" is visible.
  const persistTags = (tags: PetTag[]): boolean => {
    try {
      window.localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
    } catch {
      setState((s) => ({ ...s, saveError: "Couldn't save — your browser's storage is full. Try a smaller photo, or delete an old pet tag, then save again." }));
      return false;
    }
    setState((s) => ({ ...s, tags, ready: true, saveError: null }));
    return true;
  };

  const persistContent = (content: PetTagPageContent) => {
    window.localStorage.setItem(CONTENT_KEY, JSON.stringify(content));
    setState((s) => ({ ...s, content, ready: true }));
  };

  const lookupTag = (query: string): PetTag | null => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return state.tags.find((p) => p.tagId.toLowerCase() === q || p.petName.toLowerCase() === q) ?? null;
  };

  return (
    <PetTagContext.Provider
      value={{
        tags: state.tags,
        content: state.content,
        ready: state.ready,
        saveError: state.saveError,
        addTag: (input) => {
          const id = "pt-" + Date.now();
          const tagId = Math.random().toString(36).slice(2, 8).toUpperCase();
          return persistTags([{ id, tagId, scans: 0, ...input }, ...state.tags]);
        },
        updateTag: (id, patch) => persistTags(state.tags.map((t) => (t.id === id ? { ...t, ...patch } : t))),
        removeTag: (id) => persistTags(state.tags.filter((t) => t.id !== id)),
        lookupTag,
        recordScan: (id) => persistTags(state.tags.map((t) => (t.id === id ? { ...t, scans: t.scans + 1 } : t))),
        setBannerTitle: (bannerTitle) => persistContent({ ...state.content, bannerTitle }),
        setBannerSubtitle: (bannerSubtitle) => persistContent({ ...state.content, bannerSubtitle }),
        setSearchCaption: (searchCaption) => persistContent({ ...state.content, searchCaption }),
        updateSection: (id, patch) =>
          persistContent({ ...state.content, sections: state.content.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)) }),
        addFaq: () =>
          persistContent({
            ...state.content,
            faqs: [...state.content.faqs, { id: "faq-" + Math.random().toString(36).slice(2, 8), q: "New question", a: "Answer goes here." }],
          }),
        updateFaq: (id, patch) => persistContent({ ...state.content, faqs: state.content.faqs.map((f) => (f.id === id ? { ...f, ...patch } : f)) }),
        removeFaq: (id) => persistContent({ ...state.content, faqs: state.content.faqs.filter((f) => f.id !== id) }),
      }}
    >
      {children}
    </PetTagContext.Provider>
  );
}

export function usePetTag() {
  const ctx = useContext(PetTagContext);
  if (!ctx) throw new Error("usePetTag must be used within PetTagProvider");
  return ctx;
}
