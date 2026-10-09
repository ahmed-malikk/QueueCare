/**
 * The clinic's clock. The server runs on UTC, but the clinic's day and times are Lahore's.
 * One place for this, so the app and the database (which uses 'Asia/Karachi') agree.
 */

export const CLINIC_TIME_ZONE = "Asia/Karachi";

/** Lahore's offset from UTC. Fixed, because Pakistan doesn't use daylight saving. */
export const CLINIC_UTC_OFFSET = "+05:00";

/** The clinic's date at this moment, as YYYY-MM-DD (the same as visits.visit_date). */
export function clinicDay(now: Date): string {
  // The en-CA locale writes dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: CLINIC_TIME_ZONE }).format(now);
}
