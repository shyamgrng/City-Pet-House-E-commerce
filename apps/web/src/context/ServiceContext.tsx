"use client";

import { createContext, useContext } from "react";
import { serviceSeed } from "@/lib/service-seed";
import type { Service } from "@/lib/service-types";
import { slugify } from "@/lib/service-types";
import { useSiteContentStore } from "@/lib/site-content-store";

const STORAGE_KEY = "cph_services";

type ServiceValue = {
  services: Service[];
  ready: boolean;
  addService: (input: Omit<Service, "id">) => void;
  updateService: (id: string, input: Omit<Service, "id">) => void;
  deleteService: (id: string) => void;
};

const ServiceContext = createContext<ServiceValue | null>(null);

export function ServiceProvider({ children }: { children: React.ReactNode }) {
  const { data: services, ready, update: persist } = useSiteContentStore<Service[]>(STORAGE_KEY, serviceSeed);

  const addService = (input: Omit<Service, "id">) => {
    const id = slugify(input.name) + "-" + Math.random().toString(36).slice(2, 7);
    persist([...services, { ...input, id }]);
  };

  const updateService = (id: string, input: Omit<Service, "id">) => {
    persist(services.map((s) => (s.id === id ? { ...input, id } : s)));
  };

  const deleteService = (id: string) => {
    persist(services.filter((s) => s.id !== id));
  };

  return <ServiceContext.Provider value={{ services, ready, addService, updateService, deleteService }}>{children}</ServiceContext.Provider>;
}

export function useServices() {
  const ctx = useContext(ServiceContext);
  if (!ctx) throw new Error("useServices must be used within ServiceProvider");
  return ctx;
}
