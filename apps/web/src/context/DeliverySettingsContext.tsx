"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "cph_delivery_settings";

type DeliverySettings = { standardFee: number; puppyFee: number };

const DEFAULT_SETTINGS: DeliverySettings = { standardFee: 150, puppyFee: 250 };

type DeliverySettingsValue = DeliverySettings & {
  ready: boolean;
  setFees: (standardFee: number, puppyFee: number) => void;
};

const DeliverySettingsContext = createContext<DeliverySettingsValue | null>(null);

function loadStored(): DeliverySettings {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw);
    return { standardFee: Number(parsed.standardFee) || DEFAULT_SETTINGS.standardFee, puppyFee: Number(parsed.puppyFee) || DEFAULT_SETTINGS.puppyFee };
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

  const setFees = (standardFee: number, puppyFee: number) => {
    const next = { standardFee, puppyFee };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setState({ ...next, ready: true });
  };

  return (
    <DeliverySettingsContext.Provider value={{ standardFee: state.standardFee, puppyFee: state.puppyFee, ready: state.ready, setFees }}>
      {children}
    </DeliverySettingsContext.Provider>
  );
}

export function useDeliverySettings() {
  const ctx = useContext(DeliverySettingsContext);
  if (!ctx) throw new Error("useDeliverySettings must be used within DeliverySettingsProvider");
  return ctx;
}
