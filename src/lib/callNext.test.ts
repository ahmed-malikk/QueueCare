import { describe, expect, it } from "vitest";
import type { QueueVisit, Urgency } from "./priorityQueue";
import { planCallNext } from "./callNext";

/** A time on 9 October 2026 in Lahore, e.g. at("18:20"). */
const at = (time: string) => new Date(`2026-10-09T${time}:00+05:00`);

/** visit("A", 1, 0, "18:20") = token 1, Normal, walk-in, arrived 18:20. */
function visit(id: string, tokenNumber: number, urgency: Urgency, arrived: string): QueueVisit {
  return { id, tokenNumber, urgency, kind: "walk_in", arrivedAt: at(arrived), bookedAt: null };
}

describe("UT-19 planCallNext: what one press of Call next does", () => {
  const now = at("19:00");

  it("finishes the patient with the doctor and calls the next by priority", () => {
    const withDoctor = visit("D", 4, 0, "18:10");
    const waiting = [visit("A", 1, 0, "18:45"), visit("B", 2, 0, "18:50")];
    expect(planCallNext(waiting, withDoctor, now)).toEqual({
      finishId: "D",
      call: { id: "A", outOfOrder: false },
    });
  });

  it("calls the first patient of the evening when nobody is with the doctor yet", () => {
    expect(planCallNext([visit("A", 1, 0, "18:45")], null, now)).toEqual({
      finishId: null,
      call: { id: "A", outOfOrder: false },
    });
  });

  it("flags an urgent patient called ahead of someone who arrived earlier", () => {
    const waiting = [visit("A", 1, 0, "18:45"), visit("E", 2, 2, "18:55")];
    expect(planCallNext(waiting, null, now).call).toEqual({ id: "E", outOfOrder: true });
  });

  it("only finishes the current patient when nobody is waiting", () => {
    expect(planCallNext([], visit("D", 4, 0, "18:10"), now)).toEqual({ finishId: "D", call: null });
  });

  it("does nothing when nobody is with the doctor or waiting", () => {
    expect(planCallNext([], null, now)).toEqual({ finishId: null, call: null });
  });
});
