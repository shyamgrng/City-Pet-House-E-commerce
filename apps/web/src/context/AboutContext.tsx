"use client";

import { createContext, useContext } from "react";
import { aboutSeed } from "@/lib/about-seed";
import type { AboutContent, AboutListItem } from "@/lib/about-types";
import { useSiteContentStore } from "@/lib/site-content-store";

const STORAGE_KEY = "cph_about";

type AboutValue = {
  content: AboutContent;
  ready: boolean;
  setIntro: (intro: string) => void;
  setClosingText: (text: string) => void;
  addWhyChoose: () => void;
  updateWhyChoose: (id: string, patch: Partial<Omit<AboutListItem, "id">>) => void;
  removeWhyChoose: (id: string) => void;
  updateCommitment: (id: string, patch: Partial<Omit<AboutListItem, "id">>) => void;
};

const AboutContext = createContext<AboutValue | null>(null);

export function AboutProvider({ children }: { children: React.ReactNode }) {
  const { data: content, ready, update: persist } = useSiteContentStore<AboutContent>(STORAGE_KEY, aboutSeed);

  return (
    <AboutContext.Provider
      value={{
        content,
        ready,
        setIntro: (intro) => persist({ ...content, intro }),
        setClosingText: (closingText) => persist({ ...content, closingText }),
        addWhyChoose: () =>
          persist({
            ...content,
            whyChoose: [...content.whyChoose, { id: "why-" + Math.random().toString(36).slice(2, 8), title: "", desc: "", icon: "" }],
          }),
        updateWhyChoose: (id, patch) => persist({ ...content, whyChoose: content.whyChoose.map((w) => (w.id === id ? { ...w, ...patch } : w)) }),
        removeWhyChoose: (id) => persist({ ...content, whyChoose: content.whyChoose.filter((w) => w.id !== id) }),
        updateCommitment: (id, patch) =>
          persist({ ...content, commitments: content.commitments.map((c) => (c.id === id ? { ...c, ...patch } : c)) }),
      }}
    >
      {children}
    </AboutContext.Provider>
  );
}

export function useAbout() {
  const ctx = useContext(AboutContext);
  if (!ctx) throw new Error("useAbout must be used within AboutProvider");
  return ctx;
}
