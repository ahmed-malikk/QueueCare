/**
 * QueueCare patient status: what a patient sees after scanning their token.
 * Pure logic. The data comes from the database function visit_status (migration 002), which
 * returns the patient's own token plus today's waiting queue WITHOUT names or token numbers.
 * The position is worked out with the same priority queue reception and the doctor use,
 * so all screens agree.
 */
import { clinicDay } from "./clinicTime";
import { estimateWait, orderQueue, type QueueVisit, type Urgency } from "./priorityQueue";
import { formatToken } from "./registration";

/** Exactly what visit_status returns (or null for a wrong code). */
export type StatusResponse = {
  token_number: number;
  status: "waiting" | "called" | "done" | "missed";
  visit_date: string;
  with_doctor: number | null;
  waiting: {
    me: boolean;
    urgency: number;
    kind: "walk_in" | "booked";
    arrived_at: string;
    booked_at: string | null;
    tie: number; // order of the token numbers, without revealing them
  }[];
  recent_minutes: number[];
};

export type PatientStatus =
  | {
      state: "waiting";
      token: string;
      position: number; // 1 = next in
      estimate: { patientsAhead: number; low: number; high: number };
      withDoctor: string | null;
    }
  | { state: "called" | "done" | "missed"; token: string }
  | { state: "another-day"; token: string; visitDate: string };

export function describeStatus(response: StatusResponse, now: Date): PatientStatus {
  const token = formatToken(response.token_number);

  if (response.visit_date !== clinicDay(now)) {
    return { state: "another-day", token, visitDate: response.visit_date };
  }
  if (response.status !== "waiting") {
    return { state: response.status, token };
  }

  // Rebuild today's queue in the priority queue's shape. Other patients get stand-in ids;
  // "tie" stands in for the token number, which only matters to break exact ties.
  const queue: QueueVisit[] = response.waiting.map((visit) => ({
    id: visit.me ? "me" : `other-${visit.tie}`,
    tokenNumber: visit.tie,
    urgency: visit.urgency as Urgency,
    kind: visit.kind,
    arrivedAt: new Date(visit.arrived_at),
    bookedAt: visit.booked_at ? new Date(visit.booked_at) : null,
  }));
  const index = orderQueue(queue, now).findIndex((visit) => visit.id === "me");
  const patientsAhead = index === -1 ? queue.length : index;

  return {
    state: "waiting",
    token,
    position: patientsAhead + 1,
    estimate: { patientsAhead, ...estimateWait(patientsAhead, response.recent_minutes) },
    withDoctor: response.with_doctor === null ? null : formatToken(response.with_doctor),
  };
}
