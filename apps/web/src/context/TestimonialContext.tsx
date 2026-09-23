"use client";

import { createContext, useContext } from "react";
import { testimonialSeed } from "@/lib/testimonial-seed";
import type { Testimonial } from "@/lib/testimonial-types";
import { useSiteContentStore } from "@/lib/site-content-store";

const STORAGE_KEY = "cph_testimonials";

type TestimonialValue = {
  testimonials: Testimonial[];
  ready: boolean;
  addTestimonial: (input: Omit<Testimonial, "id">) => void;
  updateTestimonial: (id: string, input: Omit<Testimonial, "id">) => void;
  removeTestimonial: (id: string) => void;
};

const TestimonialContext = createContext<TestimonialValue | null>(null);

export function TestimonialProvider({ children }: { children: React.ReactNode }) {
  const { data: testimonials, ready, update: persist } = useSiteContentStore<Testimonial[]>(STORAGE_KEY, testimonialSeed);

  return (
    <TestimonialContext.Provider
      value={{
        testimonials,
        ready,
        addTestimonial: (input) => persist([{ id: "t-" + Date.now(), ...input }, ...testimonials]),
        updateTestimonial: (id, input) => persist(testimonials.map((t) => (t.id === id ? { id, ...input } : t))),
        removeTestimonial: (id) => persist(testimonials.filter((t) => t.id !== id)),
      }}
    >
      {children}
    </TestimonialContext.Provider>
  );
}

export function useTestimonials() {
  const ctx = useContext(TestimonialContext);
  if (!ctx) throw new Error("useTestimonials must be used within TestimonialProvider");
  return ctx;
}
