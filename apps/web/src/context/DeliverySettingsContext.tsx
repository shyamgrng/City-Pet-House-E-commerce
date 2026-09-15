"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { CourierPackageSize } from "@/lib/catalog-types";

const STORAGE_KEY = "cph_delivery_settings";

type DeliverySettings = {
  /** City Pet House's own customer-facing delivery fee per tier -- independent of any courier's cost. */
  customerFeeSmall: number;
  customerFeeMedium: number;
  customerFeeLarge: number;
  customerFeeVeryLarge: number;
  puppyFee: number;
  freeDeliveryThreshold: number;
  /** Highest tier still eligible for the free-delivery waiver — "Medium" means Small & Medium qualify. */
  freeDeliveryMaxTier: CourierPackageSize;
};

const DEFAULT_SETTINGS: DeliverySettings = {
  customerFeeSmall: 100,
  customerFeeMedium: 150,
  customerFeeLarge: 220,
  customerFeeVeryLarge: 300,
  puppyFee: 250,
  freeDeliveryThreshold: 10000,
  freeDeliveryMaxTier: "Medium",
};

type DeliverySettingsValue = DeliverySettings & {
  ready: boolean;
  /** The 4 tier fees above, keyed for calculateDeliveryFee. */
  customerFees: Record<CourierPackageSize, number>;
  setSettings: (settings: DeliverySettings) => void;
};

const DeliverySettingsContext = createContext<DeliverySettingsValue | null>(null);

function loadStored(): DeliverySettings {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw);
    return {
      customerFeeSmall: Number(parsed.customerFeeSmall) || DEFAULT_SETTINGS.customerFeeSmall,
      customerFeeMedium: Number(parsed.customerFeeMedium) || DEFAULT_SETTINGS.customerFeeMedium,
      customerFeeLarge: Number(parsed.customerFeeLarge) || DEFAULT_SETTINGS.customerFeeLarge,
      customerFeeVeryLarge: Number(parsed.customerFeeVeryLarge) || DEFAULT_SETTINGS.customerFeeVeryLarge,
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
        customerFeeSmall: state.customerFeeSmall,
        customerFeeMedium: state.customerFeeMedium,
        customerFeeLarge: state.customerFeeLarge,
        customerFeeVeryLarge: state.customerFeeVeryLarge,
        puppyFee: state.puppyFee,
        freeDeliveryThreshold: state.freeDeliveryThreshold,
        freeDeliveryMaxTier: state.freeDeliveryMaxTier,
        customerFees: {
          Small: state.customerFeeSmall,
          Medium: state.customerFeeMedium,
          Large: state.customerFeeLarge,
          "Very Large": state.customerFeeVeryLarge,
        },
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
