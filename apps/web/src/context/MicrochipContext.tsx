"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { microchipContentSeed, microchipSeed } from "@/lib/microchip-seed";
import type { MicrochipPageContent, MicrochipRecord } from "@/lib/microchip-types";

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

function loadRecords(): MicrochipRecord[] {
  const raw = window.localStorage.getItem(RECORDS_KEY);
  if (!raw) return microchipSeed;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : microchipSeed;
  } catch {
    return microchipSeed;
  }
}

function loadContent(): MicrochipPageContent {
  const raw = window.localStorage.getItem(CONTENT_KEY);
  if (!raw) return microchipContentSeed;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : microchipContentSeed;
  } catch {
    return microchipContentSeed;
  }
}

export function MicrochipProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ records: MicrochipRecord[]; content: MicrochipPageContent; ready: boolean }>({
    records: microchipSeed,
    content: microchipContentSeed,
    ready: false,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ records: loadRecords(), content: loadContent(), ready: true });
  }, []);

  const persistRecords = (records: MicrochipRecord[]) => {
    window.localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    setState((s) => ({ ...s, records, ready: true }));
  };

  const persistContent = (content: MicrochipPageContent) => {
    window.localStorage.setItem(CONTENT_KEY, JSON.stringify(content));
    setState((s) => ({ ...s, content, ready: true }));
  };

  const lookupRecord = (query: string): MicrochipRecord | null => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return state.records.find((m) => m.mcNumber.toLowerCase() === q || m.petName.toLowerCase() === q) ?? null;
  };

  return (
    <MicrochipContext.Provider
      value={{
        records: state.records,
        content: state.content,
        ready: state.ready,
        addRecord: (input) => {
          const id = "mc-" + Date.now();
          persistRecords([{ id, ...input }, ...state.records]);
        },
        updateRecord: (id, patch) => persistRecords(state.records.map((m) => (m.id === id ? { ...m, ...patch } : m))),
        removeRecord: (id) => persistRecords(state.records.filter((m) => m.id !== id)),
        lookupRecord,
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
