"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { siteSettings, type SiteSettings } from "@/lib/site-settings";

const STORAGE_KEY = "cph_site_settings";

type SiteSettingsValue = {
  settings: SiteSettings;
  ready: boolean;
  updateSettings: (patch: Partial<SiteSettings>) => void;
};

const SiteSettingsContext = createContext<SiteSettingsValue | null>(null);

function loadStored(): SiteSettings {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return siteSettings;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? { ...siteSettings, ...parsed } : siteSettings;
  } catch {
    return siteSettings;
  }
}

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ settings: SiteSettings; ready: boolean }>({ settings: siteSettings, ready: false });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ settings: loadStored(), ready: true });
  }, []);

  const updateSettings = (patch: Partial<SiteSettings>) => {
    setState((s) => {
      const settings = { ...s.settings, ...patch };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      return { settings, ready: true };
    });
  };

  return (
    <SiteSettingsContext.Provider value={{ settings: state.settings, ready: state.ready, updateSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error("useSiteSettings must be used within SiteSettingsProvider");
  return ctx;
}
