"use client";

import { createContext, useContext, useState } from "react";
import { parseLegacyAge } from "@/lib/pet-age";
import { petTagContentSeed, petTagSeed } from "@/lib/pet-tag-seed";
import type { PetTag, PetTagPageContent } from "@/lib/pet-tag-types";
import { supabase } from "@/lib/supabase";
import { useSiteContentStore } from "@/lib/site-content-store";

const TAGS_KEY = "cph_pet_tags";
const CONTENT_KEY = "cph_pet_tag_content";
const QUOTA_MESSAGE = "Couldn't save — your browser's storage is full. Try a smaller photo, or delete an old pet tag, then save again.";

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

export function PetTagProvider({ children }: { children: React.ReactNode }) {
  const { data: rawTags, ready: tagsReady, update: persistTagsRaw, saveError: cloudSaveError } = useSiteContentStore<PetTag[]>(TAGS_KEY, petTagSeed);
  const { data: content, ready: contentReady, update: persistContent } = useSiteContentStore<PetTagPageContent>(CONTENT_KEY, petTagContentSeed);
  const tags = rawTags.map(normalizeTag);
  const [quotaError, setQuotaError] = useState<string | null>(null);

  // Saving a large photo can exceed the browser's localStorage quota -- surface that instead of
  // silently discarding the edit, so "I uploaded a photo but it's not there" is visible. This
  // only applies when there's no cloud database to save to instead (Postgres doesn't have a
  // comparable per-browser quota); in cloud mode the save is optimistic and any failure surfaces
  // through `cloudSaveError` a moment later, the same as every other admin-editable page.
  const persistTags = (next: PetTag[]): boolean => {
    if (!supabase) {
      try {
        window.localStorage.setItem(TAGS_KEY, JSON.stringify(next));
      } catch {
        setQuotaError(QUOTA_MESSAGE);
        return false;
      }
    }
    setQuotaError(null);
    persistTagsRaw(next);
    return true;
  };

  const lookupTag = (query: string): PetTag | null => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return tags.find((p) => p.tagId.toLowerCase() === q || p.petName.toLowerCase() === q) ?? null;
  };

  return (
    <PetTagContext.Provider
      value={{
        tags,
        content,
        ready: tagsReady && contentReady,
        saveError: quotaError ?? cloudSaveError,
        addTag: (input) => {
          const id = "pt-" + Date.now();
          const tagId = Math.random().toString(36).slice(2, 8).toUpperCase();
          return persistTags([{ id, tagId, scans: 0, ...input }, ...tags]);
        },
        updateTag: (id, patch) => persistTags(tags.map((t) => (t.id === id ? { ...t, ...patch } : t))),
        removeTag: (id) => persistTags(tags.filter((t) => t.id !== id)),
        lookupTag,
        recordScan: (id) => persistTags(tags.map((t) => (t.id === id ? { ...t, scans: t.scans + 1 } : t))),
        setBannerTitle: (bannerTitle) => persistContent({ ...content, bannerTitle }),
        setBannerSubtitle: (bannerSubtitle) => persistContent({ ...content, bannerSubtitle }),
        setSearchCaption: (searchCaption) => persistContent({ ...content, searchCaption }),
        updateSection: (id, patch) => persistContent({ ...content, sections: content.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)) }),
        addFaq: () =>
          persistContent({
            ...content,
            faqs: [...content.faqs, { id: "faq-" + Math.random().toString(36).slice(2, 8), q: "New question", a: "Answer goes here." }],
          }),
        updateFaq: (id, patch) => persistContent({ ...content, faqs: content.faqs.map((f) => (f.id === id ? { ...f, ...patch } : f)) }),
        removeFaq: (id) => persistContent({ ...content, faqs: content.faqs.filter((f) => f.id !== id) }),
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
