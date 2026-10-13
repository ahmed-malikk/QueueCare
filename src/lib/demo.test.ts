import { describe, expect, it } from "vitest";
import { isDemoEmail, otherRole } from "./demo";

describe("isDemoEmail (UT-23)", () => {
  it("accepts the public demo accounts", () => {
    expect(isDemoEmail("reception@queuecare.demo")).toBe(true);
    expect(isDemoEmail("doctor@queuecare.demo")).toBe(true);
    expect(isDemoEmail("  Doctor@QueueCare.Demo ")).toBe(true);
  });

  it("rejects real accounts and look-alikes", () => {
    expect(isDemoEmail("reception@clinic.pk")).toBe(false);
    expect(isDemoEmail("queuecare.demo@gmail.com")).toBe(false);
    expect(isDemoEmail("someone@queuecare.demo.evil.com")).toBe(false);
    expect(isDemoEmail("")).toBe(false);
    expect(isDemoEmail(null)).toBe(false);
  });
});

describe("otherRole", () => {
  it("switches between the two staff roles", () => {
    expect(otherRole("receptionist")).toBe("doctor");
    expect(otherRole("doctor")).toBe("receptionist");
  });
});
