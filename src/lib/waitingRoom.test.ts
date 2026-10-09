import { describe, expect, it } from "vitest";
import { describeWaitingRoom } from "./waitingRoom";

describe("UT-21 describeWaitingRoom: the Now serving screen", () => {
  it("shows the token with the doctor and the next three", () => {
    expect(describeWaitingRoom({ with_doctor: 11, priority: false, next: [12, 14, 13], waiting_count: 7 })).toEqual({
      nowServing: "A-11",
      priorityCalled: false,
      next: ["A-12", "A-14", "A-13"], // the database's order is kept
      waitingCount: 7,
    });
  });

  it("flags a priority call, without saying why", () => {
    expect(describeWaitingRoom({ with_doctor: 15, priority: true, next: [], waiting_count: 0 }).priorityCalled).toBe(true);
  });

  it("never shows more than three upcoming tokens", () => {
    expect(describeWaitingRoom({ with_doctor: 1, priority: false, next: [2, 3, 4, 5], waiting_count: 4 }).next).toHaveLength(3);
  });

  it("shows nobody being served before the first call of the day", () => {
    expect(describeWaitingRoom({ with_doctor: null, priority: true, next: [1], waiting_count: 1 })).toMatchObject({
      nowServing: null,
      priorityCalled: false,
    });
  });
});
