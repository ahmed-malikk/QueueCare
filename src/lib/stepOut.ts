/**
 * QueueCare step-out advice: what the patient's phone says about leaving the waiting room.
 * Pure logic, no screens or database.
 *
 * Rule (from the interviews: patients want to step out without missing their turn; PRD, #34):
 *   - more than COME_BACK_AT patients ahead: they can step out, and are told when to come back
 *   - 1 to COME_BACK_AT ahead: come back to the waiting room now
 *   - nobody ahead: they are next, so stay
 */

/** Come back when this many patients (or fewer) are ahead of you. */
export const COME_BACK_AT = 2;

export type StepOutAdvice = "step-out" | "come-back" | "next";

export function stepOutAdvice(patientsAhead: number): StepOutAdvice {
  if (patientsAhead <= 0) return "next";
  if (patientsAhead <= COME_BACK_AT) return "come-back";
  return "step-out";
}
