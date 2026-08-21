"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { testimonialSeed } from "@/lib/testimonial-seed";
import type { Testimonial } from "@/lib/testimonial-types";

const STORAGE_KEY = "cph_testimonials";

type TestimonialValue = {
  testimonials: Testimonial[];
  ready: boolean;
  addTestimonial: (input: Omit<Testimonial, "id">) => void;
  updateTestimonial: (id: string, input: Omit<Testimonial, "id">) => void;
  removeTestimonial: (id: string) => void;
};

const TestimonialContext = createContext<TestimonialValue | null>(null);

function loadStored(): Testimonial[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Testimonial[]) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : testimonialSeed;
  } catch {
    return testimonialSeed;
  }
}

export function TestimonialProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ testimonials: Testimonial[]; ready: boolean }>({ testimonials: testimonialSeed, ready: false });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ testimonials: loadStored(), ready: true });
  }, []);

  const persist = (testimonials: Testimonial[]) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(testimonials));
    setState({ testimonials, ready: true });
  };

  return (
    <TestimonialContext.Provider
      value={{
        testimonials: state.testimonials,
        ready: state.ready,
        addTestimonial: (input) => persist([{ id: "t-" + Date.now(), ...input }, ...state.testimonials]),
        updateTestimonial: (id, input) => persist(state.testimonials.map((t) => (t.id === id ? { id, ...input } : t))),
        removeTestimonial: (id) => persist(state.testimonials.filter((t) => t.id !== id)),
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
