"use client";

import { createContext, useContext } from "react";
import { paymentMethodsSeed } from "@/lib/payment-methods-seed";
import type { PaymentMethod } from "@/lib/payment-methods-types";
import { useSiteContentStore } from "@/lib/site-content-store";

const STORAGE_KEY = "cph_payment_methods";

type PaymentMethodsValue = {
  methods: PaymentMethod[];
  ready: boolean;
  toggleMethod: (key: string) => void;
  setQr: (key: string, dataUrl: string) => void;
  setBankDetails: (key: string, patch: Partial<Pick<PaymentMethod, "bankName" | "accountName" | "accountNumber">>) => void;
};

const PaymentMethodsContext = createContext<PaymentMethodsValue | null>(null);

function normalizeMethod(m: Partial<PaymentMethod> & Pick<PaymentMethod, "key">): PaymentMethod {
  return { label: m.key, active: true, kind: "static-qr", qrImage: "", bankName: "", accountName: "", accountNumber: "", ...m };
}

export function PaymentMethodsProvider({ children }: { children: React.ReactNode }) {
  const { data: rawMethods, ready, update: persist } = useSiteContentStore<PaymentMethod[]>(STORAGE_KEY, paymentMethodsSeed);
  const methods = rawMethods.map(normalizeMethod);

  const toggleMethod = (key: string) => {
    persist(methods.map((m) => (m.key === key ? { ...m, active: !m.active } : m)));
  };

  const setQr = (key: string, dataUrl: string) => {
    persist(methods.map((m) => (m.key === key ? { ...m, qrImage: dataUrl } : m)));
  };

  const setBankDetails = (key: string, patch: Partial<Pick<PaymentMethod, "bankName" | "accountName" | "accountNumber">>) => {
    persist(methods.map((m) => (m.key === key ? { ...m, ...patch } : m)));
  };

  return (
    <PaymentMethodsContext.Provider value={{ methods, ready, toggleMethod, setQr, setBankDetails }}>{children}</PaymentMethodsContext.Provider>
  );
}

export function usePaymentMethods() {
  const ctx = useContext(PaymentMethodsContext);
  if (!ctx) throw new Error("usePaymentMethods must be used within PaymentMethodsProvider");
  return ctx;
}
