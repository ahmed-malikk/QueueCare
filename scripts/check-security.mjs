// Proves the database security rules work, by trying each action as each role.
// Run: node scripts/check-security.mjs   (reads .env.local; needs the demo accounts)
//
// Test rows are named "Security check" and marked done straight away, so they never wait in the queue.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { orderQueue } from "../src/lib/priorityQueue.ts"; // Node 22 runs TypeScript by stripping the types

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
let testCode;
let testToken;
{
  const { data, error } = await reception
    .from("visits")
    .insert(testVisit)
    .select("id, token_number, public_code")
    .single();
  testId = data?.id;
  testCode = data?.public_code;
  testToken = data?.token_number;
  check("Receptionist can register a patient and gets a token number", !error && data?.token_number >= 1, error?.message);
}

// ── Patient status page (002): public, by the secret code only ──
{
  const { data, error } = await anon.rpc("visit_status", { p_code: testCode });
  const text = JSON.stringify(data ?? {});
  check("Public can read a token's status with its code", !error && data?.token_number === testToken, error?.message);
  check(
    "The status shows no names and no other token numbers",
    !error && !text.includes("Security check") && !text.includes("patient_name") &&
      (data?.waiting ?? []).every((visit) => !("token_number" in visit)),
  );
}
{
  const { data, error } = await anon.rpc("visit_status", { p_code: "0".repeat(32) });
  check("A wrong code shows nothing", !error && data === null, error?.message);
}

// ── Waiting-room display (003): public, token numbers only ──
{
  const { data, error } = await anon.rpc("waiting_room");
  const text = JSON.stringify(data ?? {});
  check(
    "Public can read the waiting-room display, with no names or urgency",
    !error && Array.isArray(data?.next) && !text.includes("Security check") && !text.includes("urgency"),
    error?.message,
  );

  // The database orders the queue itself (so urgency never leaves it). Prove it agrees with
  // the app's rules: add a mix of patients, order today's waiting visits with orderQueue(),
  // and compare the next three. The mix is finished straight afterwards.
  const inAnHour = new Date(Date.now() + 60 * 60_000).toISOString();
  const { data: mix } = await reception
    .from("visits")
    .insert([
      { ...testVisit, urgency: 0 },
      { ...testVisit, urgency: 2 },
      { ...testVisit, kind: "booked", booked_at: inAnHour, urgency: 1 },
      { ...testVisit, urgency: 1 },
    ])
    .select("id");
  const { data: ordered } = await anon.rpc("waiting_room");
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi" }).format(new Date());
  const { data: rows } = await reception
    .from("visits")
    .select("id, token_number, urgency, kind, arrived_at, booked_at")
    .eq("visit_date", today)
    .eq("status", "waiting");
  const expected = orderQueue(
    (rows ?? []).map((row) => ({
      id: row.id,
      tokenNumber: row.token_number,
      urgency: row.urgency,
      kind: row.kind,
      arrivedAt: new Date(row.arrived_at),
      bookedAt: row.booked_at ? new Date(row.booked_at) : null,
    })),
    new Date(),
  )
    .slice(0, 3)
    .map((visit) => visit.tokenNumber);
  check(
    "The display's next three match the app's queue rules",
    (mix?.length ?? 0) === 4 && JSON.stringify(ordered?.next) === JSON.stringify(expected),
    `database ${JSON.stringify(ordered?.next)}, app ${JSON.stringify(expected)}, ${rows?.length ?? 0} waiting`,
  );
  await reception
    .from("visits")
    .update({ status: "done", done_at: new Date().toISOString() })
    .in("id", (mix ?? []).map((visit) => visit.id));
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
