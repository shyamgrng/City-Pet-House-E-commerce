"use client";

import { createContext, useContext } from "react";
import { homeContentSeed } from "@/lib/home-content-seed";
import type { HomeContent } from "@/lib/home-content-types";
import { useSiteContentStore } from "@/lib/site-content-store";

const STORAGE_KEY = "cph_home_content";

type HomeContentValue = {
  content: HomeContent;
  ready: boolean;
  update: (patch: Partial<HomeContent>) => void;
  setCategoryImage: (name: string, dataUrl: string) => void;
  setBrandImage: (name: string, dataUrl: string) => void;
};

const HomeContentContext = createContext<HomeContentValue | null>(null);

export function HomeContentProvider({ children }: { children: React.ReactNode }) {
  const { data: content, ready, update: persist } = useSiteContentStore<HomeContent>(STORAGE_KEY, homeContentSeed);

  const update = (patch: Partial<HomeContent>) => {
    persist({ ...content, ...patch });
  };

  const setCategoryImage = (name: string, dataUrl: string) => {
    const categoryImages = { ...content.categoryImages };
    if (dataUrl) categoryImages[name] = dataUrl;
    else delete categoryImages[name];
    persist({ ...content, categoryImages });
  };

  const setBrandImage = (name: string, dataUrl: string) => {
    const brandImages = { ...content.brandImages };
    if (dataUrl) brandImages[name] = dataUrl;
    else delete brandImages[name];
    persist({ ...content, brandImages });
  };

  return (
    <HomeContentContext.Provider value={{ content, ready, update, setCategoryImage, setBrandImage }}>{children}</HomeContentContext.Provider>
  );
}

export function useHomeContent() {
  const ctx = useContext(HomeContentContext);
  if (!ctx) throw new Error("useHomeContent must be used within HomeContentProvider");
  return ctx;
}
