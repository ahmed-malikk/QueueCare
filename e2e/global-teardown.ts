import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { RECEPTION } from "./helpers";

/** Supabase's public URL and key: from the environment, or from .env.local when run locally. */
function publicConfig() {
  const env: Record<string, string | undefined> = { ...process.env };
  try {
    for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
      const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
      if (match && !env[match[1]]) env[match[1]] = match[2];
    }
  } catch {
    // No .env.local (e.g. in CI): the environment must provide the values.
  }
  return { url: env.NEXT_PUBLIC_SUPABASE_URL, key: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY };
}

/**
 * After every run: the system tests register "E2E test patient" visits, and visits are never
 * deleted. Mark the ones still waiting as missed, so the demo queue stays usable. This signs in
 * as the demo receptionist, so row-level security applies exactly as it does in the app.
 */
export default async function globalTeardown() {
  const { url, key } = publicConfig();
  if (!url || !key) {
    console.warn("[teardown] Supabase URL or key missing; test patients were not tidied up.");
    return;
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error: signInError } = await supabase.auth.signInWithPassword(RECEPTION);
  if (signInError) {
    console.warn(`[teardown] Could not sign in as reception: ${signInError.message}`);
    return;
  }
  const { data, error } = await supabase
    .from("visits")
    .update({ status: "missed" })
    .eq("patient_name", "E2E test patient")
    .eq("status", "waiting")
    .select("id");
  if (error) console.warn(`[teardown] Could not tidy up test patients: ${error.message}`);
  else console.log(`[teardown] Marked ${data.length} test patient(s) as missed.`);
  await supabase.auth.signOut();
}
