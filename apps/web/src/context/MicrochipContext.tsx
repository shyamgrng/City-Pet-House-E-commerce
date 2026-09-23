"use client";

import { createContext, useContext } from "react";
import { microchipContentSeed, microchipSeed } from "@/lib/microchip-seed";
import type { MicrochipPageContent, MicrochipRecord } from "@/lib/microchip-types";
import { useSiteContentStore } from "@/lib/site-content-store";

const RECORDS_KEY = "cph_microchip_records";
const CONTENT_KEY = "cph_microchip_content";

type MicrochipValue = {
  records: MicrochipRecord[];
  content: MicrochipPageContent;
  ready: boolean;
  addRecord: (input: Omit<MicrochipRecord, "id">) => void;
  updateRecord: (id: string, patch: Partial<Omit<MicrochipRecord, "id">>) => void;
  removeRecord: (id: string) => void;
  lookupRecord: (query: string) => MicrochipRecord | null;
  setBannerTitle: (v: string) => void;
  setBannerSubtitle: (v: string) => void;
  setSearchCaption: (v: string) => void;
  updateSection: (id: string, patch: { heading?: string; body?: string }) => void;
  addFaq: () => void;
  updateFaq: (id: string, patch: { q?: string; a?: string }) => void;
  removeFaq: (id: string) => void;
};

const MicrochipContext = createContext<MicrochipValue | null>(null);

export function MicrochipProvider({ children }: { children: React.ReactNode }) {
  const { data: records, ready: recordsReady, update: persistRecords } = useSiteContentStore<MicrochipRecord[]>(RECORDS_KEY, microchipSeed);
  const { data: content, ready: contentReady, update: persistContent } = useSiteContentStore<MicrochipPageContent>(CONTENT_KEY, microchipContentSeed);

  const lookupRecord = (query: string): MicrochipRecord | null => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return records.find((m) => m.mcNumber.toLowerCase() === q || m.petName.toLowerCase() === q) ?? null;
  };

  return (
    <MicrochipContext.Provider
      value={{
        records,
        content,
        ready: recordsReady && contentReady,
        addRecord: (input) => {
          const id = "mc-" + Date.now();
          persistRecords([{ id, ...input }, ...records]);
        },
        updateRecord: (id, patch) => persistRecords(records.map((m) => (m.id === id ? { ...m, ...patch } : m))),
        removeRecord: (id) => persistRecords(records.filter((m) => m.id !== id)),
        lookupRecord,
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
    </MicrochipContext.Provider>
  );
}

export function useMicrochip() {
  const ctx = useContext(MicrochipContext);
  if (!ctx) throw new Error("useMicrochip must be used within MicrochipProvider");
  return ctx;
}

export function microchipAddress(m: MicrochipRecord): string {
  return [m.houseNo, m.municipality, m.wardNo ? `Ward ${m.wardNo}` : "", m.district, m.provinceNo, m.zone].filter(Boolean).join(", ");
}
