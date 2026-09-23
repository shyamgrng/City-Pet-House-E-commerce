import { useEffect, useState } from "react";
import { supabase } from "./supabase";

/** Mirrors apps/web/src/lib/site-content-store.ts's merge rule: an array replaces the fallback
 * outright (object-spreading an array onto another produces a plain object, not an array); a
 * plain object shallow-merges onto the fallback so a field the fallback has that the live row
 * predates still shows up. */
function mergeWithFallback<T>(fallback: T, incoming: unknown): T {
  if (incoming == null || typeof incoming !== "object") return fallback;
  if (Array.isArray(fallback)) return (Array.isArray(incoming) ? incoming : fallback) as T;
  if (Array.isArray(incoming)) return fallback;
  return { ...fallback, ...incoming } as T;
}

/**
 * Read-only counterpart to the website admin's `site_content` table (see
 * supabase/site-content-schema.sql and apps/web/src/lib/site-content-store.ts) -- `storageKey`
 * is the same string the matching web page/context already uses (e.g. "cph_services").
 *
 * Starts with `fallback` (the app's built-in sample content) so the screen never shows empty
 * while the network request is in flight, then swaps in the live row once it arrives. If
 * Supabase isn't configured (no apps/mobile/.env.local) or the fetch fails, it just keeps
 * showing `fallback` -- same "still works, just not live" degrade as the website.
 */
export function useSiteContent<T>(storageKey: string, fallback: T): T {
  const [data, setData] = useState<T>(fallback);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    const db = supabase;

    (async () => {
      const { data: row, error } = await db.from("site_content").select("data").eq("id", storageKey).maybeSingle();
      if (cancelled || error || !row) return;
      setData(mergeWithFallback(fallback, row.data));
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  return data;
}
