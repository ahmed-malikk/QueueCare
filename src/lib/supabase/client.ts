import { createBrowserClient } from "@supabase/ssr";

/** A Supabase client for Client Components (used for live updates). Only the public key is here. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
