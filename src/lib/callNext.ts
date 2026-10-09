/**
 * QueueCare "Call next": what one press of the doctor's button should do.
 * Pure logic, no screens or database. It only decides; the Server Action
 * (src/app/doctor/actions.ts) reads the queue, calls this, and saves the result.
 *
 * Rules (from the PRD, US-4):
 *   1. The patient with the doctor (if any) is finished.
 *   2. The highest-priority waiting patient (if any) is called, using the priority queue.
 *   3. If they were called ahead of someone who arrived earlier, that is flagged, so the
 *      waiting-room screen can say "Priority patient called" (no names, no medical details).
 */
import { nextPatient, wasCalledOutOfOrder, type QueueVisit } from "./priorityQueue";

/** What to save: who to finish (or null) and who to call (or null). */
export type CallPlan = {
  finishId: string | null;
  call: { id: string; outOfOrder: boolean } | null;
};

/** Task 1: plan one press of Call next. */
export function planCallNext(waiting: QueueVisit[], withDoctor: QueueVisit | null, now: Date): CallPlan {
  const next = nextPatient(waiting, now);
  const others = waiting.filter((visit) => visit.id !== next?.id);

  return {
    finishId: withDoctor ? withDoctor.id : null,
    call: next ? { id: next.id, outOfOrder: wasCalledOutOfOrder(next, others) } : null,
  };
}
