/**
 * QueueCare priority queue: who the doctor sees next, and roughly how long each patient will wait.
 * Pure logic, no screens or database, so it can be tested on its own.
 *
 * Rules (from the PRD, §6):
 *   1. Urgency: Emergency (2) > Urgent (1) > Normal (0).
 *   2. Aging: every 30 minutes of waiting counts as one level, up to Urgent (1).
 *   3. Booked patients count as arriving 10 minutes before their booking, or when they arrived if later.
 *   4. Ties go to the earlier effective arrival, then the lower token number.
 */

export type Urgency = 0 | 1 | 2; // 0 Normal, 1 Urgent, 2 Emergency

export type QueueVisit = {
  id: string;
  tokenNumber: number;
  urgency: Urgency;
  kind: "walk_in" | "booked";
  arrivedAt: Date;
  bookedAt: Date | null; // only for booked patients
};

export const AGING_MINUTES = 30;
export const BOOKED_HEAD_START_MINUTES = 10;
export const MAX_AGED_LEVEL = 1;
export const DEFAULT_CONSULTATION_MINUTES = 10;
export const RECENT_CONSULTATIONS = 5;

const MS_PER_MINUTE = 60_000;

// ── Time ─────────────────────────────────────────────────────────────────────

/** Whole minutes from `from` to `to`, rounded down, never negative. */
export function minutesBetween(from: Date, to: Date): number {
  const differenceInMs = to.getTime() - from.getTime();
  const minutes = differenceInMs / MS_PER_MINUTE;
  const wholeMinutes = Math.floor(minutes);
  return wholeMinutes >= 0 ? wholeMinutes : 0;
}

/** When this patient counts as having arrived (booked patients get a head start). */
export function effectiveArrival(visit: QueueVisit): Date {
  if (visit.kind === "walk_in" || visit.bookedAt === null) {
    return visit.arrivedAt;
  }
  const headStart = new Date(visit.bookedAt.getTime() - BOOKED_HEAD_START_MINUTES * MS_PER_MINUTE);
  // Arriving early doesn't help; arriving late means counting from the real arrival.
  return visit.arrivedAt > headStart ? visit.arrivedAt : headStart;
}

// ── Priority ─────────────────────────────────────────────────────────────────

/** The patient's priority level right now: their urgency, raised by waiting time. */
export function effectiveLevel(visit: QueueVisit, now: Date): number {
  if (visit.urgency === 2) {
    return 2; // emergencies always come first
  }
  const waited = minutesBetween(effectiveArrival(visit), now);
  const agingBonus = Math.floor(waited / AGING_MINUTES);
  return Math.min(visit.urgency + agingBonus, MAX_AGED_LEVEL);
}

/** A new list, most important patient first. Does not change the list it is given. */
export function orderQueue(visits: QueueVisit[], now: Date): QueueVisit[] {
  return [...visits].sort(
    (a, b) =>
      effectiveLevel(b, now) - effectiveLevel(a, now) || // higher level first
      effectiveArrival(a).getTime() - effectiveArrival(b).getTime() || // then earlier arrival
      a.tokenNumber - b.tokenNumber, // then lower token
  );
}

/** The patient "Call next" should pick, or null if nobody is waiting. */
export function nextPatient(visits: QueueVisit[], now: Date): QueueVisit | null {
  return orderQueue(visits, now)[0] ?? null;
}

/** True if someone who effectively arrived earlier is still waiting (shown as "Priority patient called"). */
export function wasCalledOutOfOrder(called: QueueVisit, stillWaiting: QueueVisit[]): boolean {
  const calledAt = effectiveArrival(called);
  return stillWaiting.some((waiting) => effectiveArrival(waiting) < calledAt);
}

// ── Wait estimate ────────────────────────────────────────────────────────────

/**
 * Estimated wait range in minutes: patients ahead × the average of the last 5 consultations
 * (10 minutes until there is any history), shown as 80–125% of that, rounded to 5 minutes.
 * `recentMinutes` is oldest first.
 */
export function estimateWait(patientsAhead: number, recentMinutes: number[]): { low: number; high: number } {
  if (patientsAhead <= 0) {
    return { low: 0, high: 0 };
  }
  const recent = recentMinutes.slice(-RECENT_CONSULTATIONS);
  const average =
    recent.length > 0 ? recent.reduce((sum, minutes) => sum + minutes, 0) / recent.length : DEFAULT_CONSULTATION_MINUTES;
  const expected = patientsAhead * average;
  const roundTo5 = (minutes: number) => Math.round(minutes / 5) * 5;
  return { low: roundTo5(expected * 0.8), high: roundTo5(expected * 1.25) };
}
