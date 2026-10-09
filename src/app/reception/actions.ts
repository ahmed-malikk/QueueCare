"use server";

import { refresh } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/dal";
import { estimateForNewPatient } from "@/lib/queueData";
import { formatToken, validateRegistration, type RegistrationErrors, type RegistrationInput } from "@/lib/registration";

export type IssuedToken = {
  token: string;
  patientName: string;
  statusPath: string; // e.g. /status/3f9a…; the page adds its own address for the QR code
  estimate: { patientsAhead: number; low: number; high: number };
};

export type RegisterState = {
  attempt: number; // changes on every submit, so the form knows to reset or keep its values
  errors: RegistrationErrors;
  message: string | null;
  values: RegistrationInput | null; // what was typed, kept when there are errors
  issued: IssuedToken | null;
};

/** Runs on the server when the receptionist presses Register. */
export async function registerPatient(previous: RegisterState, formData: FormData): Promise<RegisterState> {
  const attempt = previous.attempt + 1;
  const values: RegistrationInput = {
    name: String(formData.get("name") ?? ""),
    kind: String(formData.get("kind") ?? ""),
    bookedTime: String(formData.get("bookedTime") ?? ""),
    urgency: String(formData.get("urgency") ?? ""),
  };
  const failed = (message: string | null, errors: RegistrationErrors = {}): RegisterState => ({
    attempt,
    errors,
    message,
    values,
    issued: null, // never leave the previous patient's token on screen next to an error
  });

  // The page already checked this, but a Server Action can be called directly, so check again.
  const user = await getCurrentUser();
  if (user?.role !== "receptionist") return failed("Only reception can register patients. Please sign in again.");

  const now = new Date();
  const result = validateRegistration(values, now);
  if (!result.ok) return failed(null, result.errors);
  const patient = result.value;

  const supabase = await createClient();
  let estimate: IssuedToken["estimate"];
  try {
    estimate = await estimateForNewPatient(supabase, patient, now);
  } catch {
    return failed("The queue couldn't be read. Check the connection and try again.");
  }

  // The database sets the arrival time, token number and status-link code itself.
  const { data, error } = await supabase
    .from("visits")
    .insert({
      patient_name: patient.patientName,
      kind: patient.kind,
      booked_at: patient.bookedAt?.toISOString() ?? null,
      urgency: patient.urgency,
      estimate_low_min: estimate.low,
      estimate_high_min: estimate.high,
    })
    .select("token_number, public_code")
    .single();
  if (error || !data) return failed("The patient couldn't be saved. Check the connection and try again.");
  refresh(); // re-render the page so the new patient appears in today's queue

  return {
    attempt,
    errors: {},
    message: null,
    values: null,
    issued: {
      token: formatToken(data.token_number),
      patientName: patient.patientName,
      statusPath: `/status/${data.public_code}`,
      estimate,
    },
  };
}

export type UrgencyChangeResult = { ok: true } | { ok: false; message: string };

/**
 * Runs when the receptionist taps Normal, Urgent or Emergency on a patient in the queue.
 * Only waiting patients can change; the queue re-orders when the page re-renders.
 */
export async function changeUrgency(visitId: string, urgency: number): Promise<UrgencyChangeResult> {
  const user = await getCurrentUser();
  if (user?.role !== "receptionist") return { ok: false, message: "Only reception can change urgency." };
  if (urgency !== 0 && urgency !== 1 && urgency !== 2) return { ok: false, message: "Choose an urgency level." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("visits")
    .update({ urgency })
    .eq("id", visitId)
    .eq("status", "waiting") // a patient already called keeps their record as it was
    .select("id");
  if (error) return { ok: false, message: "The change couldn't be saved. Check the connection and try again." };
  if (!data || data.length === 0) return { ok: false, message: "That patient is no longer waiting." };

  refresh();
  return { ok: true };
}
