"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { CourierPackageSize } from "@/lib/catalog-types";
import type { DeliveryFeeTier } from "@/lib/delivery-fee";

const STORAGE_KEY = "cph_delivery_settings";

/** City Pet House's own customer-facing delivery fee per package size -- set by CPH directly and
 * completely independent of any courier's rate card or cost. */
type StandardRates = {
  standardFeeSmall: number;
  standardFeeMedium: number;
  standardFeeLarge: number;
  standardFeeVeryLarge: number;
};

type DeliverySettings = StandardRates & {
  puppyFee: number;
  feeTiers: DeliveryFeeTier[];
  /** Highest package tier still eligible for a value-tier discount/free-shipping — "Medium" means Small & Medium qualify, Large/Very Large always pay the full size-based fee. */
  freeDeliveryMaxTier: CourierPackageSize;
};

export const DEFAULT_FEE_TIERS: DeliveryFeeTier[] = [
  { id: "tier-1", minAmount: 50, maxAmount: 1999, fee: 150, active: true },
  { id: "tier-2", minAmount: 2000, maxAmount: 3499, fee: 200, active: true },
  { id: "tier-3", minAmount: 3500, maxAmount: 5999, fee: 100, active: true },
  { id: "tier-4", minAmount: 6000, maxAmount: null, fee: 0, active: true },
];

const DEFAULT_SETTINGS: DeliverySettings = {
  standardFeeSmall: 150,
  standardFeeMedium: 150,
  standardFeeLarge: 250,
  standardFeeVeryLarge: 350,
  puppyFee: 250,
  feeTiers: DEFAULT_FEE_TIERS,
  freeDeliveryMaxTier: "Medium",
};

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
    // A pre-tiered-standard-fee settings blob only has a single flat `standardFee` -- migrate it
    // into all four size tiers so existing configured values aren't silently discarded.
    const legacyFlatFee = Number(parsed.standardFee) || null;
    const tiers = Array.isArray(parsed.feeTiers) && parsed.feeTiers.length ? (parsed.feeTiers as DeliveryFeeTier[]) : DEFAULT_FEE_TIERS;
    return {
      standardFeeSmall: Number(parsed.standardFeeSmall) || legacyFlatFee || DEFAULT_SETTINGS.standardFeeSmall,
      standardFeeMedium: Number(parsed.standardFeeMedium) || legacyFlatFee || DEFAULT_SETTINGS.standardFeeMedium,
      standardFeeLarge: Number(parsed.standardFeeLarge) || legacyFlatFee || DEFAULT_SETTINGS.standardFeeLarge,
      standardFeeVeryLarge: Number(parsed.standardFeeVeryLarge) || legacyFlatFee || DEFAULT_SETTINGS.standardFeeVeryLarge,
      puppyFee: Number(parsed.puppyFee) || DEFAULT_SETTINGS.puppyFee,
      feeTiers: tiers,
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
        standardFeeSmall: state.standardFeeSmall,
        standardFeeMedium: state.standardFeeMedium,
        standardFeeLarge: state.standardFeeLarge,
        standardFeeVeryLarge: state.standardFeeVeryLarge,
        puppyFee: state.puppyFee,
        feeTiers: state.feeTiers,
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
