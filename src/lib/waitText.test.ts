import { describe, expect, it } from "vitest";
import { formatEstimate } from "./waitText";

describe("UT-16 formatEstimate: the wait in words", () => {
  it("says next in line only when nobody is ahead", () => {
    expect(formatEstimate({ patientsAhead: 0, low: 0, high: 0 })).toBe("Next in line");
  });
  it("doesn't say next in line when someone is ahead but the estimate rounds to 0", () => {
    expect(formatEstimate({ patientsAhead: 1, low: 0, high: 0 })).toBe("Under 5 min");
  });
  it("shows a range, or one number when both ends are equal", () => {
    expect(formatEstimate({ patientsAhead: 2, low: 15, high: 25 })).toBe("About 15–25 min");
    expect(formatEstimate({ patientsAhead: 1, low: 5, high: 5 })).toBe("About 5 min");
  });
});
