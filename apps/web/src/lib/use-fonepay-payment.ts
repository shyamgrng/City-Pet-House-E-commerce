"use client";

import { useEffect, useRef, useState } from "react";

type FonepayPaymentState = {
  qrMessage: string | null;
  loading: boolean;
  error: string | null;
  verified: boolean;
};

const POLL_INTERVAL_MS = 4000;
const POLL_TIMEOUT_MS = 10 * 60 * 1000;

/** Requests a Fonepay Dynamic QR for `amount` once `enabled` is true, then polls the payment
 * status every few seconds so `verified` flips to true the moment Fonepay confirms the payment
 * — this only surfaces a confirmation badge to reassure the customer/admin; it never replaces
 * the admin's manual approval step. */
export function useFonepayPayment(reference: string, amount: number, remarks1: string, remarks2: string, enabled: boolean) {
  const [state, setState] = useState<FonepayPaymentState>({ qrMessage: null, loading: false, error: null, verified: false });
  const prnRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || amount <= 0) return;
    let cancelled = false;
    setState({ qrMessage: null, loading: true, error: null, verified: false });

    (async () => {
      const res = await fetch("/api/fonepay/create-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, reference, remarks1, remarks2 }),
      });
      const body = await res.json().catch(() => null);
      if (cancelled) return;

      if (!res.ok || !body?.ok) {
        setState({ qrMessage: null, loading: false, error: body?.error || "Could not load the Fonepay QR.", verified: false });
        return;
      }

      prnRef.current = body.prn;
      setState({ qrMessage: body.qrMessage, loading: false, error: null, verified: false });
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, reference, amount]);

  useEffect(() => {
    if (!enabled || state.loading || !state.qrMessage || state.verified) return;
    let cancelled = false;
    const startedAt = Date.now();

    const poll = async () => {
      const prn = prnRef.current;
      if (!prn || cancelled) return;
      const res = await fetch(`/api/fonepay/status?prn=${encodeURIComponent(prn)}`);
      const body = await res.json().catch(() => null);
      if (cancelled) return;

      if (body?.ok && body.paymentStatus === "success") {
        setState((s) => ({ ...s, verified: true }));
        return;
      }
      if (Date.now() - startedAt < POLL_TIMEOUT_MS) {
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    };

    let timer = setTimeout(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, state.loading, state.qrMessage, state.verified]);

  return state;
}
