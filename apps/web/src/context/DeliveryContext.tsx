"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { deliverySeed } from "@/lib/delivery-seed";
import type { Delivery } from "@/lib/delivery-types";

const STORAGE_KEY = "cph_deliveries";

type DeliveryValue = {
  deliveries: Delivery[];
  ready: boolean;
  addDelivery: (delivery: Delivery) => void;
  assignCourier: (id: string, courierId: string, courierName: string) => void;
  markReceived: (id: string) => void;
  assignDeliveryPerson: (id: string, dpName: string, dpPhone: string) => void;
  markDelivered: (id: string) => void;
  cancelDelivery: (id: string, reason: string) => void;
};

const DeliveryContext = createContext<DeliveryValue | null>(null);

function loadStored(): Delivery[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return deliverySeed;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : deliverySeed;
  } catch {
    return deliverySeed;
  }
}

export function DeliveryProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ deliveries: Delivery[]; ready: boolean }>({ deliveries: deliverySeed, ready: false });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ deliveries: loadStored(), ready: true });
  }, []);

  const persist = (deliveries: Delivery[]) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(deliveries));
    setState({ deliveries, ready: true });
  };

  const update = (id: string, patch: Partial<Delivery>) => {
    persist(state.deliveries.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  };

  return (
    <DeliveryContext.Provider
      value={{
        deliveries: state.deliveries,
        ready: state.ready,
        addDelivery: (delivery) => {
          if (state.deliveries.some((d) => d.id === delivery.id)) return;
          persist([...state.deliveries, delivery]);
        },
        assignCourier: (id, courierId, courierName) => update(id, { status: "Dispatched", courierId, courierName, dispatchedAt: Date.now() }),
        markReceived: (id) => update(id, { status: "Received" }),
        assignDeliveryPerson: (id, dpName, dpPhone) => update(id, { status: "Processing", dpName, dpPhone }),
        markDelivered: (id) => update(id, { status: "Delivered", deliveredAt: Date.now() }),
        cancelDelivery: (id, reason) => update(id, { status: "Cancelled", cancelReason: reason }),
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
}

export function useDelivery() {
  const ctx = useContext(DeliveryContext);
  if (!ctx) throw new Error("useDelivery must be used within DeliveryProvider");
  return ctx;
}
