import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * `null` until apps/mobile/.env.local has these two vars set (see .env.example) -- every
 * consumer must handle that case by falling back to the app's built-in sample content, so the
 * app still works before Supabase is configured locally.
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey, { auth: { persistSession: false } }) : null;
