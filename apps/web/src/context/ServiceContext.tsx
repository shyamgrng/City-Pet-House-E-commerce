"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { serviceSeed } from "@/lib/service-seed";
import type { Service } from "@/lib/service-types";
import { slugify } from "@/lib/service-types";

const STORAGE_KEY = "cph_services";

type ServiceValue = {
  services: Service[];
  ready: boolean;
  addService: (input: Omit<Service, "id">) => void;
  updateService: (id: string, input: Omit<Service, "id">) => void;
  deleteService: (id: string) => void;
};

const ServiceContext = createContext<ServiceValue | null>(null);

function loadStored(): Service[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Service[]) : serviceSeed;
  } catch {
    return serviceSeed;
  }
}

export function ServiceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ services: Service[]; ready: boolean }>({ services: serviceSeed, ready: false });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ services: loadStored(), ready: true });
  }, []);

  const persist = (services: Service[]) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
    setState({ services, ready: true });
  };

  const addService = (input: Omit<Service, "id">) => {
    const id = slugify(input.name) + "-" + Math.random().toString(36).slice(2, 7);
    persist([...state.services, { ...input, id }]);
  };

  const updateService = (id: string, input: Omit<Service, "id">) => {
    persist(state.services.map((s) => (s.id === id ? { ...input, id } : s)));
  };

  const deleteService = (id: string) => {
    persist(state.services.filter((s) => s.id !== id));
  };

  return (
    <ServiceContext.Provider value={{ services: state.services, ready: state.ready, addService, updateService, deleteService }}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useServices() {
  const ctx = useContext(ServiceContext);
  if (!ctx) throw new Error("useServices must be used within ServiceProvider");
  return ctx;
}
