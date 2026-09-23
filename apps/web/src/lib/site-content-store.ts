"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

const CLOUD_ERROR_MESSAGE = "Couldn't save — check your internet connection and try again.";

/**
 * Merges freshly-loaded data onto `seed`. Array content (Services, Blog posts, Dog breeds,
 * Testimonials, ...) replaces the seed outright -- object-spreading an array onto another
 * would produce a plain object with numeric keys instead of an array. Object content (Home,
 * FAQ, About, ...) shallow-merges onto the seed so a field added to the seed later (by a
 * future code change) still shows up for someone whose saved data predates it.
 */
function mergeWithSeed<T>(seed: T, incoming: unknown): T {
  if (incoming == null || typeof incoming !== "object") return seed;
  if (Array.isArray(seed)) return (Array.isArray(incoming) ? incoming : seed) as T;
  if (Array.isArray(incoming)) return seed;
  return { ...seed, ...incoming } as T;
}

/**
 * Shared backend for every admin-editable page's content (Home, Services, Blog, FAQ, Career,
 * About, Legal pages, How to Buy, the archives, Testimonials, Contact, Dog Breed Archive).
 *
 * Cloud mode (Supabase configured): content lives in the `site_content` table so an edit made
 * in admin is visible to every visitor and to the mobile app, with realtime push so a second
 * open tab/device sees it without reloading. Local mode (no Supabase env vars, or the
 * `site_content` table hasn't been created yet): falls back to the original per-browser
 * localStorage behavior -- fine for previewing, but an edit made there never reaches anyone else.
 *
 * `storageKey` doubles as both the localStorage key (unchanged from before this existed, so an
 * edit already sitting in someone's browser isn't lost) and the row id in `site_content`.
 */
export function useSiteContentStore<T>(storageKey: string, seed: T) {
  const [state, setState] = useState<{ data: T; ready: boolean; saveError: string | null }>({ data: seed, ready: false, saveError: null });

  const loadLocal = (): T => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return seed;
      return mergeWithSeed(seed, JSON.parse(raw));
    } catch {
      return seed;
    }
  };

  useEffect(() => {
    if (!supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ data: loadLocal(), ready: true, saveError: null });
      const onStorage = (e: StorageEvent) => {
        if (e.key === storageKey) setState((s) => ({ ...s, data: loadLocal() }));
      };
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    }

    let cancelled = false;
    const db = supabase;

    (async () => {
      const { data: row, error } = await db.from("site_content").select("data").eq("id", storageKey).maybeSingle();
      if (cancelled) return;

      if (error) {
        // Most commonly: the site_content table hasn't been created yet (supabase/site-content-schema.sql
        // not run yet) -- degrade to the same local-only behavior as when Supabase isn't configured.
        setState({ data: loadLocal(), ready: true, saveError: null });
        return;
      }

      if (!row) {
        // Nothing in the cloud for this page yet -- carry forward any edit already sitting in
        // this browser (from before this table existed) instead of discarding it.
        const initial = loadLocal();
        void db.from("site_content").upsert({ id: storageKey, data: initial });
        setState({ data: initial, ready: true, saveError: null });
        return;
      }

      setState({ data: mergeWithSeed(seed, row.data), ready: true, saveError: null });
    })();

    const channel = db
      .channel(`site_content-${storageKey}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "site_content", filter: `id=eq.${storageKey}` }, (payload) => {
        if (payload.eventType === "DELETE") return;
        const row = payload.new as { data: unknown };
        setState((s) => ({ ...s, data: mergeWithSeed(seed, row.data) }));
      })
      .subscribe();

    return () => {
      cancelled = true;
      void db.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const update = (data: T) => {
    setState((s) => ({ ...s, data, saveError: null }));

    // Always write through to localStorage first, cloud-configured or not. If Supabase is
    // configured but the site_content table hasn't been created yet (supabase/site-content-schema.sql
    // not run), the upsert below fails -- without this, the edit would vanish on refresh instead
    // of at least surviving in this browser, same as every page did before this store existed.
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(data));
    } catch {
      setState((s) => ({ ...s, saveError: "Couldn't save — your browser's storage is full. Delete an old photo somewhere on the site to free up space, then try again." }));
    }

    if (supabase) {
      const db = supabase;
      void db
        .from("site_content")
        .upsert({ id: storageKey, data, updated_at: new Date().toISOString() })
        .then(({ error }) => {
          if (error) setState((s) => ({ ...s, saveError: CLOUD_ERROR_MESSAGE }));
        });
    }
  };

  return { data: state.data, ready: state.ready, saveError: state.saveError, update };
}
