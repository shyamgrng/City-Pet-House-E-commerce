"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { CourierPackageSize } from "@/lib/catalog-types";

const STORAGE_KEY = "cph_delivery_settings";

type DeliverySettings = {
  standardFee: number;
  puppyFee: number;
  freeDeliveryThreshold: number;
  /** Highest tier still eligible for the free-delivery waiver — "Medium" means Small & Medium qualify. */
  freeDeliveryMaxTier: CourierPackageSize;
};

const DEFAULT_SETTINGS: DeliverySettings = { standardFee: 150, puppyFee: 250, freeDeliveryThreshold: 10000, freeDeliveryMaxTier: "Medium" };

type DeliverySettingsValue = DeliverySettings & {
  ready: boolean;
  setSettings: (settings: DeliverySettings) => void;
};

const DeliverySettingsContext = createContext<DeliverySettingsValue | null>(null);

function loadStored(): DeliverySettings {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw);
    return {
      standardFee: Number(parsed.standardFee) || DEFAULT_SETTINGS.standardFee,
      puppyFee: Number(parsed.puppyFee) || DEFAULT_SETTINGS.puppyFee,
      freeDeliveryThreshold: Number(parsed.freeDeliveryThreshold) || DEFAULT_SETTINGS.freeDeliveryThreshold,
      freeDeliveryMaxTier: parsed.freeDeliveryMaxTier === "Small" ? "Small" : DEFAULT_SETTINGS.freeDeliveryMaxTier,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function DeliverySettingsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DeliverySettings & { ready: boolean }>({ ...DEFAULT_SETTINGS, ready: false });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ ...loadStored(), ready: true });
  }, []);

  const setSettings = (settings: DeliverySettings) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setState({ ...settings, ready: true });
  };

  return (
    <DeliverySettingsContext.Provider
      value={{
        standardFee: state.standardFee,
        puppyFee: state.puppyFee,
        freeDeliveryThreshold: state.freeDeliveryThreshold,
        freeDeliveryMaxTier: state.freeDeliveryMaxTier,
        ready: state.ready,
        setSettings,
      }}
    >
      {children}
    </DeliverySettingsContext.Provider>
  );
}

export function useDeliverySettings() {
  const ctx = useContext(DeliverySettingsContext);
  if (!ctx) throw new Error("useDeliverySettings must be used within DeliverySettingsProvider");
  return ctx;
}
