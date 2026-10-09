import { describe, expect, it } from "vitest";
import { clinicDay } from "./clinicTime";

describe("UT-15 clinicDay: the date in Lahore, whatever the server's clock says", () => {
  it("gives the Lahore date", () => {
    expect(clinicDay(new Date("2026-10-09T18:00:00+05:00"))).toBe("2026-10-09");
  });
  it("has already moved to the next day after midnight in Lahore, while UTC is still on the day before", () => {
    expect(clinicDay(new Date("2026-10-09T00:30:00+05:00"))).toBe("2026-10-09");
    expect(clinicDay(new Date("2026-10-08T23:59:00+05:00"))).toBe("2026-10-08");
  });
});
