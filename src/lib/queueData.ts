import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { estimateWait, minutesBetween, orderQueue, type QueueVisit, type Urgency } from "@/lib/priorityQueue";
import type { Registration } from "@/lib/registration";
import { clinicDay } from "@/lib/clinicTime";

type VisitRow = {
  id: string;
  token_number: number;
  urgency: number;
  kind: "walk_in" | "booked";
  arrived_at: string;
  booked_at: string | null;
};

/** A database row in the shape the priority queue works with. */
export function toQueueVisit(row: VisitRow): QueueVisit {
  return {
    id: row.id,
    tokenNumber: row.token_number,
    urgency: row.urgency as Urgency,
    kind: row.kind,
    arrivedAt: new Date(row.arrived_at),
    bookedAt: row.booked_at ? new Date(row.booked_at) : null,
  };
}

/** Everyone still waiting today. Row-level security means only staff get rows back. */
export async function getWaitingToday(supabase: SupabaseClient, now: Date): Promise<QueueVisit[]> {
  const { data, error } = await supabase
    .from("visits")
    .select("id, token_number, urgency, kind, arrived_at, booked_at")
    .eq("visit_date", clinicDay(now))
    .eq("status", "waiting");
  if (error) throw error;
  return (data ?? []).map(toQueueVisit);
}

/** How long today's most recent consultations took, oldest first (for the wait estimate). */
export async function getRecentConsultMinutes(supabase: SupabaseClient, now: Date): Promise<number[]> {
  const { data, error } = await supabase
    .from("visits")
    .select("called_at, done_at")
    .eq("visit_date", clinicDay(now))
    .eq("status", "done")
    .not("called_at", "is", null)
    .not("done_at", "is", null)
    .order("done_at", { ascending: false })
    .limit(5);
  if (error) throw error;
  return (data ?? [])
    .map((row) => minutesBetween(new Date(row.called_at!), new Date(row.done_at!)))
    .reverse();
}

/**
 * The wait a new patient can expect: where they would slot into today's queue right now,
 * times the recent consultation length. Saved with the visit so #12 can compare it with
 * the real wait.
 */
export async function estimateForNewPatient(supabase: SupabaseClient, patient: Registration, now: Date) {
  const [waiting, recent] = await Promise.all([
    getWaitingToday(supabase, now),
    getRecentConsultMinutes(supabase, now),
  ]);
  const newVisit: QueueVisit = {
    id: "new",
    tokenNumber: Number.MAX_SAFE_INTEGER, // not issued yet; always the last token
    urgency: patient.urgency,
    kind: patient.kind,
    arrivedAt: now,
    bookedAt: patient.bookedAt,
  };
  const patientsAhead = orderQueue([...waiting, newVisit], now).findIndex((visit) => visit.id === "new");
  return { patientsAhead, ...estimateWait(patientsAhead, recent) };
}
