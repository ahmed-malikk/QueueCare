/**
 * QueueCare queue view: the ordered queue as the rows the receptionist sees.
 * Pure logic, no screens or database. Reuses the priority queue (src/lib/priorityQueue.ts),
 * so the screen can never disagree with the order "Call next" will use.
 *
 * Each row has: its position (1 = next), the patient, their level right now, whether waiting
 * has raised it, a label such as "Normal → Urgent", and whole minutes waited since arrival.
 */
import { effectiveLevel, minutesBetween, orderQueue, type QueueVisit, type Urgency } from "./priorityQueue";

/** Index = urgency number: URGENCY_NAMES[1] is "Urgent". */
export const URGENCY_NAMES = ["Normal", "Urgent", "Emergency"] as const;

/**
 * One row. `T` is "whatever kind of visit you gave me" (for reception, a visit with a name),
 * so the row keeps every detail of the original visit.
 */
export type QueueRow<T extends QueueVisit> = {
  position: number;
  visit: T;
  level: number;
  aged: boolean;
  label: string;
  waitedMinutes: number;
};

/** Task 1: "Normal", "Urgent", "Emergency", or "Normal → Urgent" when waiting raised the level. */
export function urgencyLabel(urgency: Urgency, level: number): string {
  if (level > urgency) {
    return `${URGENCY_NAMES[urgency]} → ${URGENCY_NAMES[level]}`;
  }
  return URGENCY_NAMES[urgency];
}

/** Task 2: the queue in priority order, one row per patient, numbered from 1. */
export function buildQueueView<T extends QueueVisit>(visits: T[], now: Date): QueueRow<T>[] {
  return orderQueue(visits, now).map((visit, index) => {
    const level = effectiveLevel(visit, now);
    return {
      position: index + 1,
      visit: visit as T, // the same object that came in, so it still has the name
      level,
      aged: level > visit.urgency,
      label: urgencyLabel(visit.urgency, level),
      waitedMinutes: minutesBetween(visit.arrivedAt, now),
    };
  });
}
