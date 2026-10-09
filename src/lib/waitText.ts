/**
 * The estimated wait in words, for the token card (and later the patient's status page).
 * Decided by patients ahead, not the rounded minutes: with very short recent consultations
 * the estimate can round to 0 even when someone is ahead.
 */
export function formatEstimate({ patientsAhead, low, high }: { patientsAhead: number; low: number; high: number }) {
  if (patientsAhead === 0) return "Next in line";
  if (high < 5) return "Under 5 min";
  if (low === high) return `About ${low} min`;
  return `About ${low}–${high} min`;
}
