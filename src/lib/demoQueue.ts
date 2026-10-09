/**
 * The example queue on the home page. It is made-up data, but it runs through the same rules
 * as the real app (buildQueueView and estimateWait), so the demo can never show an order or
 * an estimate the app wouldn't.
 *
 * The story: it is 7 pm, you hold token A-14, and then an emergency (A-16) arrives.
 */
import { estimateWait, type QueueVisit } from "./priorityQueue";
import { buildQueueView } from "./queueView";
import { formatToken } from "./registration";

/** 7:00 pm in Lahore. Fixed, so the example reads the same for every visitor. */
const NOW = new Date("2026-10-09T14:00:00Z");
const MINUTE = 60_000;
const minutesAgo = (minutes: number) => new Date(NOW.getTime() - minutes * MINUTE);

export const YOUR_TOKEN = 14;
export const EMERGENCY_TOKEN = 16;
export const WITH_DOCTOR = formatToken(12);

/** The last five consultations took 6, 8, 7, 5 and 9 minutes (an average of 7). */
const RECENT_CONSULTATIONS = [6, 8, 7, 5, 9];

const walkIn = (tokenNumber: number, urgency: QueueVisit["urgency"], waited: number): QueueVisit => ({
  id: String(tokenNumber),
  tokenNumber,
  urgency,
  kind: "walk_in",
  arrivedAt: minutesAgo(waited),
  bookedAt: null,
});

const WAITING: QueueVisit[] = [
  walkIn(3, 0, 34), // Normal, but 34 minutes of waiting raises it to Urgent
  walkIn(7, 1, 5),
  walkIn(9, 0, 12),
  walkIn(YOUR_TOKEN, 0, 10),
  // Booked for 7:20 pm, so it counts as arriving at 7:10 pm
  { id: "15", tokenNumber: 15, urgency: 0, kind: "booked", arrivedAt: minutesAgo(2), bookedAt: new Date(NOW.getTime() + 20 * MINUTE) },
];

const EMERGENCY = walkIn(EMERGENCY_TOKEN, 2, 0);

export type DemoRow = { token: string; label: string; level: number; waited: number; you: boolean; isNew: boolean };
export type DemoState = { rows: DemoRow[]; ahead: number; low: number; high: number };

/** The queue before the emergency arrives, or after. */
export function demoQueue(withEmergency: boolean): DemoState {
  const visits = withEmergency ? [...WAITING, EMERGENCY] : WAITING;
  const view = buildQueueView(visits, NOW);
  const ahead = view.findIndex((row) => row.visit.tokenNumber === YOUR_TOKEN);
  const { low, high } = estimateWait(ahead, RECENT_CONSULTATIONS);

  return {
    rows: view.map((row) => ({
      token: formatToken(row.visit.tokenNumber),
      label: row.label,
      level: row.level,
      waited: row.waitedMinutes,
      you: row.visit.tokenNumber === YOUR_TOKEN,
      isNew: row.visit.tokenNumber === EMERGENCY_TOKEN,
    })),
    ahead,
    low,
    high,
  };
}
