import { describe, expect, it } from "vitest";
import { demoQueue } from "./demoQueue";

// UT-22: the home page's example queue follows the real rules.
describe("demoQueue (home page example)", () => {
  it("UT-22.1 before the emergency: aging, urgency, arrival and booking decide the order", () => {
    const state = demoQueue(false);
    expect(state.rows.map((row) => row.token)).toEqual(["A-3", "A-7", "A-9", "A-14", "A-15"]);
    expect(state.rows[0].label).toBe("Raised to Urgent");
    expect(state.ahead).toBe(3);
    // 3 patients × 7 min average = 21 min, shown as 80%–125% rounded to 5
    expect([state.low, state.high]).toEqual([15, 25]);
  });

  it("UT-22.2 the emergency goes straight to the top and the estimate grows", () => {
    const state = demoQueue(true);
    expect(state.rows[0]).toMatchObject({ token: "A-16", label: "Emergency", isNew: true });
    expect(state.rows.find((row) => row.you)?.token).toBe("A-14");
    expect(state.ahead).toBe(4);
    expect([state.low, state.high]).toEqual([20, 35]);
  });
});
