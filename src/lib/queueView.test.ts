import { describe, expect, it } from "vitest";
import type { QueueVisit, Urgency } from "./priorityQueue";
import { buildQueueView, urgencyLabel } from "./queueView";

/** A time on 9 October 2026 in Lahore, e.g. at("18:20"). */
const at = (time: string) => new Date(`2026-10-09T${time}:00+05:00`);

/** A waiting patient with a name: visit("Ali", 1, 0, "18:20") = token 1, Normal, arrived 18:20. */
function visit(name: string, tokenNumber: number, urgency: Urgency, arrived: string): QueueVisit & { name: string } {
  return { id: name, name, tokenNumber, urgency, kind: "walk_in", arrivedAt: at(arrived), bookedAt: null };
}

describe("UT-17 urgencyLabel: what the receptionist reads on each row", () => {
  it("names the urgency when waiting hasn't changed it", () => {
    expect(urgencyLabel(0, 0)).toBe("Normal");
    expect(urgencyLabel(1, 1)).toBe("Urgent");
    expect(urgencyLabel(2, 2)).toBe("Emergency");
  });
  it("shows the raise when waiting has moved a patient up", () => {
    expect(urgencyLabel(0, 1)).toBe("Raised to Urgent");
  });
});

describe("UT-18 buildQueueView: the queue as rows, most important first", () => {
  const now = at("19:00");
  const queue = [
    visit("Ali", 1, 0, "18:20"), // Normal, waited 40 min → counts as Urgent
    visit("Bina", 2, 1, "18:55"), // Urgent, waited 5 min
    visit("Chand", 3, 0, "18:50"), // Normal, waited 10 min
    visit("Dua", 4, 2, "18:58"), // Emergency
  ];

  it("numbers the rows from 1 in priority order", () => {
    const rows = buildQueueView(queue, now);
    expect(rows.map((row) => row.visit.name)).toEqual(["Dua", "Ali", "Bina", "Chand"]);
    expect(rows.map((row) => row.position)).toEqual([1, 2, 3, 4]);
  });

  it("keeps each patient's own details, such as the name", () => {
    expect(buildQueueView(queue, now)[0].visit).toBe(queue[3]);
  });

  it("marks who has been moved up by waiting, and labels it", () => {
    const ali = buildQueueView(queue, now)[1];
    expect(ali).toMatchObject({ level: 1, aged: true, label: "Raised to Urgent" });
    const chand = buildQueueView(queue, now)[3];
    expect(chand).toMatchObject({ level: 0, aged: false, label: "Normal" });
  });

  it("counts whole minutes waited since arrival", () => {
    expect(buildQueueView(queue, now).map((row) => row.waitedMinutes)).toEqual([2, 40, 5, 10]);
  });

  it("gives an empty list for an empty queue", () => {
    expect(buildQueueView([], now)).toEqual([]);
  });
});
