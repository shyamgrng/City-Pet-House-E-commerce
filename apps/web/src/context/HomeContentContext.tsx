"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { homeContentSeed } from "@/lib/home-content-seed";
import type { HomeContent } from "@/lib/home-content-types";

const STORAGE_KEY = "cph_home_content";

type HomeContentValue = {
  content: HomeContent;
  ready: boolean;
  update: (patch: Partial<HomeContent>) => void;
  setCategoryImage: (name: string, dataUrl: string) => void;
  setBrandImage: (name: string, dataUrl: string) => void;
};

const HomeContentContext = createContext<HomeContentValue | null>(null);

function load(): HomeContent {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...homeContentSeed, ...(JSON.parse(raw) as Partial<HomeContent>) } : homeContentSeed;
  } catch {
    return homeContentSeed;
  }
}

export function HomeContentProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ content: HomeContent; ready: boolean }>({ content: homeContentSeed, ready: false });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ content: load(), ready: true });
  }, []);

  const persist = (content: HomeContent) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    setState({ content, ready: true });
  };

  const update = (patch: Partial<HomeContent>) => {
    persist({ ...state.content, ...patch });
  };

  const setCategoryImage = (name: string, dataUrl: string) => {
    const categoryImages = { ...state.content.categoryImages };
    if (dataUrl) categoryImages[name] = dataUrl;
    else delete categoryImages[name];
    persist({ ...state.content, categoryImages });
  };

  const setBrandImage = (name: string, dataUrl: string) => {
    const brandImages = { ...state.content.brandImages };
    if (dataUrl) brandImages[name] = dataUrl;
    else delete brandImages[name];
    persist({ ...state.content, brandImages });
  };

  return (
    <HomeContentContext.Provider value={{ content: state.content, ready: state.ready, update, setCategoryImage, setBrandImage }}>
      {children}
    </HomeContentContext.Provider>
  );
}

export function useHomeContent() {
  const ctx = useContext(HomeContentContext);
  if (!ctx) throw new Error("useHomeContent must be used within HomeContentProvider");
  return ctx;
}
