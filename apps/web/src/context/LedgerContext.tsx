"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { LedgerPayment, NewLedgerPayment } from "@/lib/ledger-types";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "cph_ledger_payments";

const CLOUD_ERROR_MESSAGE = "Couldn't save — check your internet connection and try again.";
const STORAGE_FULL_MESSAGE = "Couldn't save — your browser's storage is full. Delete an old receipt photo somewhere on the site to free up space, then try again.";

type PaymentRow = { id: string; data: LedgerPayment };

type LedgerValue = {
  payments: LedgerPayment[];
  ready: boolean;
  saveError: string | null;
  addPayment: (input: NewLedgerPayment) => boolean;
};

const LedgerContext = createContext<LedgerValue | null>(null);

function loadStored(): LedgerPayment[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function LedgerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ payments: LedgerPayment[]; ready: boolean; saveError: string | null }>({
    payments: [],
    ready: false,
    saveError: null,
  });

  // Cloud mode (Supabase configured): payments live in a shared database so admin sees a payout
  // recorded from any device. Local mode falls back to the original per-browser localStorage
  // behavior -- everything else the Finance ledger shows (sales, commission, payables) is
  // derived live from orders/bookings/deliveries, which already sync via their own contexts.
  useEffect(() => {
    if (!supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ payments: loadStored(), ready: true, saveError: null });
      return;
    }

    let cancelled = false;
    const db = supabase;

    (async () => {
      const { data, error } = await db.from("ledger_payments").select("id, data");
      if (cancelled) return;
      if (error) {
        setState((s) => ({ ...s, ready: true, saveError: CLOUD_ERROR_MESSAGE }));
        return;
      }
      const rows = (data ?? []) as PaymentRow[];
      const payments = rows.map((r) => r.data).sort((a, b) => b.createdAt - a.createdAt);
      if (!cancelled) setState({ payments, ready: true, saveError: null });
    })();

    const channel = db
      .channel("ledger-payments-sync")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ledger_payments" }, (payload) => {
        const row = payload.new as unknown as PaymentRow;
        setState((s) => (s.payments.some((p) => p.id === row.id) ? s : { ...s, payments: [row.data, ...s.payments] }));
      })
      .subscribe();

    return () => {
      cancelled = true;
      void db.removeChannel(channel);
    };
  }, []);

  const persist = (payments: LedgerPayment[]): boolean => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
    } catch {
      setState((s) => ({ ...s, saveError: STORAGE_FULL_MESSAGE }));
      return false;
    }
    setState((s) => ({ ...s, payments, saveError: null }));
    return true;
  };

  const addPayment = (input: NewLedgerPayment): boolean => {
    const payment: LedgerPayment = { ...input, id: "PAY-" + Math.random().toString(36).slice(2, 8).toUpperCase(), createdAt: Date.now() };

    if (supabase) {
      const db = supabase;
      setState((s) => ({ ...s, payments: [payment, ...s.payments], saveError: null }));
      void db
        .from("ledger_payments")
        .insert({ id: payment.id, data: payment })
        .then(({ error }) => {
          if (error) setState((s) => ({ ...s, saveError: CLOUD_ERROR_MESSAGE }));
        });
      return true;
    }

    return persist([payment, ...state.payments]);
  };

  return (
    <LedgerContext.Provider value={{ payments: state.payments, ready: state.ready, saveError: state.saveError, addPayment }}>
      {children}
    </LedgerContext.Provider>
  );
}

export function useLedger() {
  const ctx = useContext(LedgerContext);
  if (!ctx) throw new Error("useLedger must be used within LedgerProvider");
  return ctx;
}
