"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { b2bSubmissionSeed } from "@/lib/b2b-seed";
import type { B2BProductSubmission } from "@/lib/b2b-types";

const STORAGE_KEY = "cph_b2b_submissions";

type B2BValue = {
  submissions: B2BProductSubmission[];
  ready: boolean;
  addSubmission: (input: Omit<B2BProductSubmission, "id" | "status" | "submittedAt">) => void;
  approveSubmission: (id: string) => void;
  rejectSubmission: (id: string) => void;
};

const B2BContext = createContext<B2BValue | null>(null);

// Backfills fields introduced after this record may have been saved to localStorage by an
// older build, so previously-saved submissions don't crash the new field-reading UI.
function normalizeSubmission(s: Partial<B2BProductSubmission> & { id: string; name: string }): B2BProductSubmission {
  return {
    b2bId: "",
    companyName: "",
    desc: "",
    photos: [],
    category: "",
    sku: "",
    brand: "",
    price: 0,
    qty: 0,
    lowStockAlert: 5,
    sizes: [],
    colours: [],
    courierPackageSize: "Medium",
    tags: [],
    newArrival: false,
    hotSale: false,
    hotDiscount: 0,
    todaysDeal: false,
    dealStart: "",
    dealEnd: "",
    outOfStock: false,
    commissionPct: 0,
    status: "Pending",
    submittedAt: Date.now(),
    ...s,
  };
}

function loadStored(): B2BProductSubmission[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return b2bSubmissionSeed;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed.map(normalizeSubmission) : b2bSubmissionSeed;
  } catch {
    return b2bSubmissionSeed;
  }
}

export function B2BProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ submissions: B2BProductSubmission[]; ready: boolean }>({
    submissions: b2bSubmissionSeed,
    ready: false,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ submissions: loadStored(), ready: true });
  }, []);

  const persist = (submissions: B2BProductSubmission[]) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
    setState({ submissions, ready: true });
  };

  const addSubmission = (input: Omit<B2BProductSubmission, "id" | "status" | "submittedAt">) => {
    const id = "SUB-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    persist([{ ...input, id, status: "Pending", submittedAt: Date.now() }, ...state.submissions]);
  };

  const setStatus = (id: string, status: B2BProductSubmission["status"]) => {
    persist(state.submissions.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  return (
    <B2BContext.Provider
      value={{
        submissions: state.submissions,
        ready: state.ready,
        addSubmission,
        approveSubmission: (id) => setStatus(id, "Approved"),
        rejectSubmission: (id) => setStatus(id, "Rejected"),
      }}
    >
      {children}
    </B2BContext.Provider>
  );
}

export function useB2B() {
  const ctx = useContext(B2BContext);
  if (!ctx) throw new Error("useB2B must be used within B2BProvider");
  return ctx;
}
