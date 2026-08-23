"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { paymentMethodsSeed } from "@/lib/payment-methods-seed";
import type { PaymentMethod } from "@/lib/payment-methods-types";

const STORAGE_KEY = "cph_payment_methods";

type PaymentMethodsValue = {
  methods: PaymentMethod[];
  ready: boolean;
  toggleMethod: (key: string) => void;
  setQr: (key: string, dataUrl: string) => void;
};

const PaymentMethodsContext = createContext<PaymentMethodsValue | null>(null);

function normalizeMethod(m: Partial<PaymentMethod> & Pick<PaymentMethod, "key">): PaymentMethod {
  return { label: m.key, active: true, qrImage: "", ...m };
}

function loadStored(): PaymentMethod[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return paymentMethodsSeed;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed.map(normalizeMethod) : paymentMethodsSeed;
  } catch {
    return paymentMethodsSeed;
  }
}

export function PaymentMethodsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ methods: PaymentMethod[]; ready: boolean }>({ methods: paymentMethodsSeed, ready: false });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ methods: loadStored(), ready: true });
  }, []);

  const persist = (methods: PaymentMethod[]) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(methods));
    setState({ methods, ready: true });
  };

  const toggleMethod = (key: string) => {
    persist(state.methods.map((m) => (m.key === key ? { ...m, active: !m.active } : m)));
  };

  const setQr = (key: string, dataUrl: string) => {
    persist(state.methods.map((m) => (m.key === key ? { ...m, qrImage: dataUrl } : m)));
  };

  return (
    <PaymentMethodsContext.Provider value={{ methods: state.methods, ready: state.ready, toggleMethod, setQr }}>
      {children}
    </PaymentMethodsContext.Provider>
  );
}

export function usePaymentMethods() {
  const ctx = useContext(PaymentMethodsContext);
  if (!ctx) throw new Error("usePaymentMethods must be used within PaymentMethodsProvider");
  return ctx;
}
