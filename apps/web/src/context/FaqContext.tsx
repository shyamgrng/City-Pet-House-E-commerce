"use client";

import { createContext, useContext } from "react";
import { faqSeed } from "@/lib/faq-seed";
import type { FaqPageContent } from "@/lib/faq-types";
import { useSiteContentStore } from "@/lib/site-content-store";

const STORAGE_KEY = "cph_faq_content";

type FaqValue = {
  content: FaqPageContent;
  ready: boolean;
  setPageTitle: (v: string) => void;
  setPageSubtitle: (v: string) => void;
  setContactHeading: (v: string) => void;
  setContactSubtext: (v: string) => void;
  addItem: () => void;
  updateItem: (id: string, patch: Partial<Omit<FaqPageContent["items"][number], "id">>) => void;
  removeItem: (id: string) => void;
};

const FaqContext = createContext<FaqValue | null>(null);

export function FaqProvider({ children }: { children: React.ReactNode }) {
  const { data: content, ready, update: persist } = useSiteContentStore<FaqPageContent>(STORAGE_KEY, faqSeed);

  return (
    <FaqContext.Provider
      value={{
        content,
        ready,
        setPageTitle: (pageTitle) => persist({ ...content, pageTitle }),
        setPageSubtitle: (pageSubtitle) => persist({ ...content, pageSubtitle }),
        setContactHeading: (contactHeading) => persist({ ...content, contactHeading }),
        setContactSubtext: (contactSubtext) => persist({ ...content, contactSubtext }),
        addItem: () =>
          persist({ ...content, items: [...content.items, { id: "faq-" + Date.now(), cat: "General", q: "New question", a: "Answer goes here." }] }),
        updateItem: (id, patch) => persist({ ...content, items: content.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) }),
        removeItem: (id) => persist({ ...content, items: content.items.filter((it) => it.id !== id) }),
      }}
    >
      {children}
    </FaqContext.Provider>
  );
}

export function useFaq() {
  const ctx = useContext(FaqContext);
  if (!ctx) throw new Error("useFaq must be used within FaqProvider");
  return ctx;
}
