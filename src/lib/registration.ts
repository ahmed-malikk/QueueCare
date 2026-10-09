/**
 * QueueCare registration: turning what the receptionist typed into clean, checked data.
 * Pure logic, no screens or database, so it can be tested on its own. The Server Action
 * (src/app/reception/actions.ts) calls validateRegistration before anything is saved.
 *
 * Rules (from the PRD, US-2):
 *   1. A name or initials is required: 1 to 80 characters after trimming spaces.
 *   2. Type is walk-in or booked. A booked patient needs their booked time (HH:MM, today, Lahore time).
 *   3. Urgency is Normal (0), Urgent (1) or Emergency (2).
 *   4. Every problem is reported at once, so the receptionist can fix them in one go.
 */
import type { Urgency } from "./priorityQueue";
import { CLINIC_UTC_OFFSET, clinicDay } from "./clinicTime";

export type VisitKind = "walk_in" | "booked";

/** Exactly what the form sends: every field is text. */
export type RegistrationInput = { name: string; kind: string; bookedTime: string; urgency: string };

/** Checked data, ready to save. */
export type Registration = { patientName: string; kind: VisitKind; bookedAt: Date | null; urgency: Urgency };

/** One message per field that has a problem. */
export type RegistrationErrors = Partial<Record<keyof RegistrationInput, string>>;

export type RegistrationResult = { ok: true; value: Registration } | { ok: false; errors: RegistrationErrors };

export const MAX_NAME_LENGTH = 80;

/** Task 1: the token as printed for the patient: 1 → "A-1". */
export function formatToken(tokenNumber: number): string {
  return `A-${tokenNumber}`;
}

/** Task 2: "19:30" → 19:30 today at the clinic, or null if it isn't a real HH:MM time. */
export function parseBookedTime(time: string, now: Date): Date | null {
  const match = time.match(/^(\d{2}):(\d{2})$/);
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    return null;
  }
  return new Date(`${clinicDay(now)}T${match[1]}:${match[2]}:00${CLINIC_UTC_OFFSET}`);
}

/** Task 3: check every field; return the clean data, or every error at once. */
export function validateRegistration(input: RegistrationInput, now: Date): RegistrationResult {
  const errors: RegistrationErrors = {};

  // Name: required, at most 80 characters once the spaces at both ends are removed.
  const patientName = input.name.trim();
  if (patientName.length === 0) {
    errors.name = "Enter the patient's name or initials.";
  } else if (patientName.length > MAX_NAME_LENGTH) {
    errors.name = `Keep the name to ${MAX_NAME_LENGTH} characters or fewer.`;
  }

  // Type: walk-in or booked. Only a booked patient needs (and keeps) a booked time.
  if (input.kind !== "walk_in" && input.kind !== "booked") {
    errors.kind = "Choose walk-in or booked.";
  }
  let bookedAt: Date | null = null;
  if (input.kind === "booked") {
    bookedAt = parseBookedTime(input.bookedTime, now);
    if (bookedAt === null) {
      errors.bookedTime = "Enter the booked time.";
    }
  }

  // Urgency: Normal "0", Urgent "1" or Emergency "2".
  if (input.urgency !== "0" && input.urgency !== "1" && input.urgency !== "2") {
    errors.urgency = "Choose an urgency level.";
  }

  // Every problem at once, or the clean data.
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    value: { patientName, kind: input.kind as VisitKind, bookedAt, urgency: Number(input.urgency) as Urgency },
  };
}
