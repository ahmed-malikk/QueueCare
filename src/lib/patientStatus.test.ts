import { describe, expect, it } from "vitest";
import { describeStatus, type StatusResponse } from "./patientStatus";

/** A time on 9 October 2026 in Lahore, e.g. at("18:20"). */
const at = (time: string) => new Date(`2026-10-09T${time}:00+05:00`);

/** One anonymous waiting entry, as the database function returns it. */
const entry = (tie: number, urgency: number, arrived: string, me = false) => ({
  me,
  urgency,
  kind: "walk_in" as const,
  arrived_at: at(arrived).toISOString(),
  booked_at: null,
  tie,
});

const base: StatusResponse = {
  token_number: 7,
  status: "waiting",
  visit_date: "2026-10-09",
  with_doctor: 3,
  waiting: [],
  recent_minutes: [],
};

describe("UT-20 describeStatus: what the patient sees", () => {
  const now = at("19:00");

  it("gives the patient's place, people ahead and a wait range", () => {
    const response = {
      ...base,
      waiting: [entry(4, 0, "18:40"), entry(5, 2, "18:58"), entry(7, 0, "18:50", true), entry(8, 0, "18:55")],
    };
    expect(describeStatus(response, now)).toEqual({
      state: "waiting",
      token: "A-7",
      position: 3, // the emergency and the earlier walk-in go first
      estimate: { patientsAhead: 2, low: 15, high: 25 }, // 2 × 10 min default
      withDoctor: "A-3",
    });
  });

  it("uses today's real consultation times for the estimate", () => {
    const response = { ...base, waiting: [entry(4, 0, "18:40"), entry(7, 0, "18:50", true)], recent_minutes: [6, 6, 6] };
    const status = describeStatus(response, now);
    expect(status.state === "waiting" && status.estimate).toEqual({ patientsAhead: 1, low: 5, high: 10 });
  });

  it("says next in line when nobody is ahead", () => {
    const status = describeStatus({ ...base, waiting: [entry(7, 0, "18:50", true)], with_doctor: null }, now);
    expect(status).toMatchObject({ state: "waiting", position: 1, withDoctor: null });
  });

  it("tells a called patient to go in, and reports seen or missed", () => {
    expect(describeStatus({ ...base, status: "called" }, now)).toEqual({ state: "called", token: "A-7" });
    expect(describeStatus({ ...base, status: "done" }, now)).toEqual({ state: "done", token: "A-7" });
    expect(describeStatus({ ...base, status: "missed" }, now)).toEqual({ state: "missed", token: "A-7" });
  });

  it("recognises a token from another day", () => {
    expect(describeStatus({ ...base, visit_date: "2026-10-08" }, now)).toEqual({
      state: "another-day",
      token: "A-7",
      visitDate: "2026-10-08",
    });
  });
});
