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

/**
 * The wait as a short range for the patient's phone ("20–30 min"), without "About": the
 * label underneath already says it is an expected wait.
 */
export function formatRange({ low, high }: { low: number; high: number }) {
  if (high < 5) return "Under 5 min";
  if (low === high) return `${low} min`;
  return `${low}–${high} min`;
}
