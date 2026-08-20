"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { faqSeed } from "@/lib/faq-seed";
import type { FaqPageContent } from "@/lib/faq-types";

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

function loadStored(): FaqPageContent {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return faqSeed;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : faqSeed;
  } catch {
    return faqSeed;
  }
}

export function FaqProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ content: FaqPageContent; ready: boolean }>({ content: faqSeed, ready: false });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ content: loadStored(), ready: true });
  }, []);

  const persist = (content: FaqPageContent) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    setState({ content, ready: true });
  };

  return (
    <FaqContext.Provider
      value={{
        content: state.content,
        ready: state.ready,
        setPageTitle: (pageTitle) => persist({ ...state.content, pageTitle }),
        setPageSubtitle: (pageSubtitle) => persist({ ...state.content, pageSubtitle }),
        setContactHeading: (contactHeading) => persist({ ...state.content, contactHeading }),
        setContactSubtext: (contactSubtext) => persist({ ...state.content, contactSubtext }),
        addItem: () =>
          persist({
            ...state.content,
            items: [...state.content.items, { id: "faq-" + Date.now(), cat: "General", q: "New question", a: "Answer goes here." }],
          }),
        updateItem: (id, patch) => persist({ ...state.content, items: state.content.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) }),
        removeItem: (id) => persist({ ...state.content, items: state.content.items.filter((it) => it.id !== id) }),
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
