import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * `null` until the cloud database is configured (env vars unset) -- every consumer must handle
 * that case by falling back to the browser-local storage behavior, so the site still works
 * before the Supabase project is set up.
 */
export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null;
