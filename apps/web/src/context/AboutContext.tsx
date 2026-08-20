"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { aboutSeed } from "@/lib/about-seed";
import type { AboutContent, AboutListItem } from "@/lib/about-types";

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

function loadStored(): AboutContent {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return aboutSeed;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : aboutSeed;
  } catch {
    return aboutSeed;
  }
}

export function AboutProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ content: AboutContent; ready: boolean }>({ content: aboutSeed, ready: false });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ content: loadStored(), ready: true });
  }, []);

  const persist = (content: AboutContent) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    setState({ content, ready: true });
  };

  return (
    <AboutContext.Provider
      value={{
        content: state.content,
        ready: state.ready,
        setIntro: (intro) => persist({ ...state.content, intro }),
        setClosingText: (closingText) => persist({ ...state.content, closingText }),
        addWhyChoose: () =>
          persist({
            ...state.content,
            whyChoose: [...state.content.whyChoose, { id: "why-" + Math.random().toString(36).slice(2, 8), title: "", desc: "" }],
          }),
        updateWhyChoose: (id, patch) =>
          persist({ ...state.content, whyChoose: state.content.whyChoose.map((w) => (w.id === id ? { ...w, ...patch } : w)) }),
        removeWhyChoose: (id) => persist({ ...state.content, whyChoose: state.content.whyChoose.filter((w) => w.id !== id) }),
        updateCommitment: (id, patch) =>
          persist({ ...state.content, commitments: state.content.commitments.map((c) => (c.id === id ? { ...c, ...patch } : c)) }),
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
