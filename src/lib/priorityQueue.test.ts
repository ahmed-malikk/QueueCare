import { describe, expect, it } from "vitest";
import {
  effectiveArrival,
  effectiveLevel,
  estimateWait,
  minutesBetween,
  nextPatient,
  orderQueue,
  wasCalledOutOfOrder,
  type QueueVisit,
  type Urgency,
} from "./priorityQueue";

/** A time on 8 October 2026 in Lahore, e.g. at("18:20"). */
const at = (time: string) => new Date(`2026-10-08T${time}:00+05:00`);

/** A waiting patient: visit("A", 1, 0, "18:20") = token 1, Normal, arrived 18:20. */
function visit(id: string, tokenNumber: number, urgency: Urgency, arrived: string, booked?: string): QueueVisit {
  return {
    id,
    tokenNumber,
    urgency,
    kind: booked ? "booked" : "walk_in",
    arrivedAt: at(arrived),
    bookedAt: booked ? at(booked) : null,
  };
}

const ids = (visits: QueueVisit[]) => visits.map((v) => v.id);

describe("UT-01 minutesBetween", () => {
  it("counts whole minutes between two times", () => {
    expect(minutesBetween(at("18:20"), at("19:00"))).toBe(40);
  });

  it("ignores leftover seconds (30 min 59 s counts as 30)", () => {
    expect(minutesBetween(at("18:00"), new Date("2026-10-08T18:30:59+05:00"))).toBe(30);
  });

  it("is never negative", () => {
    expect(minutesBetween(at("19:00"), at("18:00"))).toBe(0);
  });
});

describe("UT-02 effectiveArrival (booked patients get a 10-minute head start)", () => {
  it("a walk-in's effective arrival is when they actually arrived", () => {
    expect(effectiveArrival(visit("W", 1, 0, "18:25"))).toEqual(at("18:25"));
  });

  it("a booked patient who comes early counts from 10 minutes before their booking", () => {
    expect(effectiveArrival(visit("K", 1, 0, "18:00", "18:30"))).toEqual(at("18:20"));
  });

  it("a booked patient who comes late counts from when they actually arrived", () => {
    expect(effectiveArrival(visit("K", 1, 0, "18:40", "18:30"))).toEqual(at("18:40"));
  });
});

describe("UT-03 effectiveLevel (urgency plus aging)", () => {
  it("a Normal patient stays level 0 for the first 29 minutes", () => {
    expect(effectiveLevel(visit("A", 1, 0, "18:31"), at("19:00"))).toBe(0);
  });

  it("after 30 minutes of waiting, a Normal patient counts as level 1", () => {
    expect(effectiveLevel(visit("A", 1, 0, "18:30"), at("19:00"))).toBe(1);
  });

  it("aging stops at Urgent (level 1), however long the wait", () => {
    expect(effectiveLevel(visit("A", 1, 0, "17:00"), at("19:00"))).toBe(1);
    expect(effectiveLevel(visit("U", 2, 1, "17:00"), at("19:00"))).toBe(1);
  });

  it("an Emergency is always level 2", () => {
    expect(effectiveLevel(visit("E", 1, 2, "18:59"), at("19:00"))).toBe(2);
  });

  it("a booked patient's waiting time starts at their effective arrival", () => {
    // Arrived 18:00 for an 18:30 booking: counts from 18:20, so at 18:45 has waited 25 minutes.
    expect(effectiveLevel(visit("K", 1, 0, "18:00", "18:30"), at("18:45"))).toBe(0);
  });
});

describe("UT-04 orderQueue (who is called first)", () => {
  it("the gist example: Emergency first, then the aged Normal patient, then the Urgent one", () => {
    const queue = [visit("A", 1, 0, "18:20"), visit("B", 2, 1, "18:55"), visit("C", 3, 2, "18:58")];
    expect(ids(orderQueue(queue, at("19:00")))).toEqual(["C", "A", "B"]);
  });

  it("without enough waiting, the Urgent patient goes before the Normal one", () => {
    const queue = [visit("A", 1, 0, "18:45"), visit("B", 2, 1, "18:55"), visit("C", 3, 2, "18:58")];
    expect(ids(orderQueue(queue, at("19:00")))).toEqual(["C", "B", "A"]);
  });

  it("same level: whoever arrived first goes first", () => {
    const queue = [visit("late", 2, 0, "18:50"), visit("early", 1, 0, "18:40")];
    expect(ids(orderQueue(queue, at("19:00")))).toEqual(["early", "late"]);
  });

  it("same level and same arrival time: the lower token goes first", () => {
    const queue = [visit("t7", 7, 0, "18:50"), visit("t3", 3, 0, "18:50")];
    expect(ids(orderQueue(queue, at("19:00")))).toEqual(["t3", "t7"]);
  });

  it("does not change the list it was given", () => {
    const queue = [visit("late", 2, 0, "18:50"), visit("early", 1, 0, "18:40")];
    orderQueue(queue, at("19:00"));
    expect(ids(queue)).toEqual(["late", "early"]);
  });
});

describe("UT-05 booked patients", () => {
  it("a booked patient's head start puts them before a walk-in who arrived slightly earlier", () => {
    // K counts from 18:20 (10 min before an 18:30 booking); W walked in at 18:25.
    const queue = [visit("W", 1, 0, "18:25"), visit("K", 2, 0, "18:00", "18:30")];
    expect(ids(orderQueue(queue, at("18:40")))).toEqual(["K", "W"]);
  });

  it("a booking never beats a more urgent patient", () => {
    const queue = [visit("K", 1, 0, "18:00", "18:30"), visit("U", 2, 1, "18:35")];
    expect(ids(orderQueue(queue, at("18:40")))).toEqual(["U", "K"]);
  });
});

describe("UT-06 nextPatient and priority calls", () => {
  it("returns nobody when the queue is empty", () => {
    expect(nextPatient([], at("19:00"))).toBeNull();
  });

  it("returns the patient at the top of the queue", () => {
    const queue = [visit("A", 1, 0, "18:20"), visit("C", 3, 2, "18:58")];
    expect(nextPatient(queue, at("19:00"))?.id).toBe("C");
  });

  it("calling someone while an earlier arrival still waits is a priority call", () => {
    const called = visit("C", 3, 2, "18:58");
    expect(wasCalledOutOfOrder(called, [visit("A", 1, 0, "18:20")])).toBe(true);
  });

  it("calling the earliest arrival is not a priority call", () => {
    const called = visit("A", 1, 0, "18:20");
    expect(wasCalledOutOfOrder(called, [visit("C", 3, 2, "18:58")])).toBe(false);
  });

  it("a booked patient called at their effective time is not a priority call", () => {
    const called = visit("K", 2, 0, "18:00", "18:30"); // counts from 18:20
    expect(wasCalledOutOfOrder(called, [visit("W", 1, 0, "18:25")])).toBe(false);
  });
});

describe("UT-07 estimateWait (an honest range)", () => {
  it("nobody ahead means no wait", () => {
    expect(estimateWait(0, [])).toEqual({ low: 0, high: 0 });
  });

  it("with no history yet, assumes 10 minutes per patient: 3 ahead is about 25-40 min", () => {
    expect(estimateWait(3, [])).toEqual({ low: 25, high: 40 });
  });

  it("uses the average of recent consultations: [8, 12] averages 10", () => {
    expect(estimateWait(1, [8, 12])).toEqual({ low: 10, high: 15 });
  });

  it("only the 5 most recent consultations count", () => {
    // Oldest first: the two 30-minute consultations are too old to count.
    expect(estimateWait(1, [30, 30, 10, 10, 10, 10, 10])).toEqual({ low: 10, high: 15 });
  });
});
