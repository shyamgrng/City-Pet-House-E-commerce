"use client";

import { createContext, useContext } from "react";
import { contactSeed } from "@/lib/contact-seed";
import type { ContactPageContent } from "@/lib/contact-types";
import { useSiteContentStore } from "@/lib/site-content-store";

const STORAGE_KEY = "cph_contact_page";

type ContactValue = {
  content: ContactPageContent;
  ready: boolean;
  setIntro: (v: string) => void;
  setMapLink: (v: string) => void;
};

const ContactContext = createContext<ContactValue | null>(null);

export function ContactProvider({ children }: { children: React.ReactNode }) {
  const { data: content, ready, update: persist } = useSiteContentStore<ContactPageContent>(STORAGE_KEY, contactSeed);

  return (
    <ContactContext.Provider
      value={{
        content,
        ready,
        setIntro: (intro) => persist({ ...content, intro }),
        setMapLink: (mapLink) => persist({ ...content, mapLink }),
      }}
    >
      {children}
    </ContactContext.Provider>
  );
}

export function useContactPage() {
  const ctx = useContext(ContactContext);
  if (!ctx) throw new Error("useContactPage must be used within ContactProvider");
  return ctx;
}
