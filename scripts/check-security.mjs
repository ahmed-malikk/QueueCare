// Proves the database security rules work, by trying each action as each role.
// Run: node scripts/check-security.mjs   (reads .env.local; needs the demo accounts)
//
// Test rows are named "Security check" and marked done straight away, so they never wait in the queue.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((line) => line.includes("=") && !line.startsWith("#"))
    .map((line) => [line.slice(0, line.indexOf("=")).trim(), line.slice(line.indexOf("=") + 1).trim()]),
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const client = () => createClient(url, key, { auth: { persistSession: false } });

let failures = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
  if (!ok) failures++;
}
async function signedIn(email, password) {
  const c = client();
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Could not sign in as ${email}: ${error.message}`);
  return c;
}
const testVisit = { patient_name: "Security check", kind: "walk_in" };

// ── Public (not signed in) ──
const anon = client();
{
  const { data, error } = await anon.from("visits").select("patient_name");
  check("Public cannot read patient visits", !!error || data.length === 0, error?.message);
}
{
  const { error } = await anon.from("visits").insert(testVisit);
  check("Public cannot register patients", !!error, error?.message);
}
{
  const { data, error } = await anon.from("queue_ticks").select("changed_at");
  check("Public can read the queue-changed signal", !error && data.length === 1, error?.message);
}
{
  const { error } = await anon.rpc("app_role");
  check("Public cannot call internal functions", !!error, error?.message);
}

// ── Receptionist ──
const reception = await signedIn(env.DEMO_RECEPTION_EMAIL, env.DEMO_RECEPTION_PASSWORD);
{
  const { data, error } = await reception.from("visits").select("token_number");
  check("Receptionist can see the queue", !error && data.length > 0, error?.message ?? `${data.length} visits`);
}
let testId;
{
  const { data, error } = await reception.from("visits").insert(testVisit).select("id, token_number").single();
  testId = data?.id;
  check("Receptionist can register a patient and gets a token number", !error && data?.token_number >= 1, error?.message);
}

// ── Doctor ──
const doctor = await signedIn(env.DEMO_DOCTOR_EMAIL, env.DEMO_DOCTOR_PASSWORD);
{
  const { data, error } = await doctor.from("visits").select("token_number");
  check("Doctor can see the queue", !error && data.length > 0, error?.message);
}
{
  const { error } = await doctor.from("visits").insert(testVisit);
  check("Doctor cannot register patients", !!error, error?.message);
}
{
  const { error } = await reception.from("visits").insert({ ...testVisit, arrived_at: "2000-01-01T09:00:00Z" });
  check("Nobody can backdate an arrival", !!error, error?.message);
}
{
  const { error } = await reception.from("visits").update({ token_number: 999 }).eq("id", testId);
  check("Nobody can rewrite a token number", !!error, error?.message);
}
{
  const { data, error } = await doctor
    .from("visits")
    .update({ status: "done", done_at: new Date().toISOString() })
    .eq("id", testId)
    .select("status");
  check("Doctor can update a visit", !error && data?.[0]?.status === "done", error?.message);
}

console.log(failures ? `\n${failures} check(s) FAILED` : "\nAll security checks passed");
process.exit(failures ? 1 : 0);
