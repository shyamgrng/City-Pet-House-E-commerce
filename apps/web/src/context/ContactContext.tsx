"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { contactSeed } from "@/lib/contact-seed";
import type { ContactPageContent } from "@/lib/contact-types";

const STORAGE_KEY = "cph_contact_page";

type ContactValue = {
  content: ContactPageContent;
  ready: boolean;
  setIntro: (v: string) => void;
  setMapLink: (v: string) => void;
};

const ContactContext = createContext<ContactValue | null>(null);

function loadStored(): ContactPageContent {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return contactSeed;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : contactSeed;
  } catch {
    return contactSeed;
  }
}

export function ContactProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ content: ContactPageContent; ready: boolean }>({ content: contactSeed, ready: false });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ content: loadStored(), ready: true });
  }, []);

  const persist = (content: ContactPageContent) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    setState({ content, ready: true });
  };

  return (
    <ContactContext.Provider
      value={{
        content: state.content,
        ready: state.ready,
        setIntro: (intro) => persist({ ...state.content, intro }),
        setMapLink: (mapLink) => persist({ ...state.content, mapLink }),
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
