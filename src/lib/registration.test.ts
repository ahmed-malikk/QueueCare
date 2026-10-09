import { describe, expect, it } from "vitest";
import { formatToken, parseBookedTime, validateRegistration, type RegistrationInput } from "./registration";

/** A time on 9 October 2026 in Lahore, e.g. at("18:20"). */
const at = (time: string) => new Date(`2026-10-09T${time}:00+05:00`);

/** A valid form: a Normal walk-in called "Ali". Override any field. */
const form = (changes: Partial<RegistrationInput> = {}): RegistrationInput => ({
  name: "Ali",
  kind: "walk_in",
  bookedTime: "",
  urgency: "0",
  ...changes,
});

describe("UT-12 formatToken: the number printed on the token", () => {
  it("puts A- in front of the number", () => {
    expect(formatToken(1)).toBe("A-1");
    expect(formatToken(27)).toBe("A-27");
  });
});

describe("UT-13 parseBookedTime: a booked time today, in Lahore", () => {
  it("turns HH:MM into that time today", () => {
    expect(parseBookedTime("19:30", at("18:05"))).toEqual(at("19:30"));
  });
  it("uses the clinic's day, not the server's (the server clock runs on UTC)", () => {
    // 00:30 in Lahore on 9 Oct is still 8 Oct in UTC.
    expect(parseBookedTime("01:00", at("00:30"))).toEqual(at("01:00"));
  });
  it("rejects anything that isn't a real HH:MM time", () => {
    expect(parseBookedTime("", at("18:00"))).toBeNull();
    expect(parseBookedTime("7pm", at("18:00"))).toBeNull();
    expect(parseBookedTime("25:00", at("18:00"))).toBeNull();
    expect(parseBookedTime("18:60", at("18:00"))).toBeNull();
  });
});

describe("UT-14 validateRegistration: clean data or clear errors", () => {
  it("accepts a walk-in and trims the name", () => {
    expect(validateRegistration(form({ name: "  Ali K.  " }), at("18:00"))).toEqual({
      ok: true,
      value: { patientName: "Ali K.", kind: "walk_in", bookedAt: null, urgency: 0 },
    });
  });
  it("accepts a booked Urgent patient with their booking time", () => {
    expect(validateRegistration(form({ kind: "booked", bookedTime: "18:30", urgency: "1" }), at("18:00"))).toEqual({
      ok: true,
      value: { patientName: "Ali", kind: "booked", bookedAt: at("18:30"), urgency: 1 },
    });
  });
  it("ignores a booked time left over on a walk-in", () => {
    const result = validateRegistration(form({ bookedTime: "18:30" }), at("18:00"));
    expect(result.ok && result.value.bookedAt).toBeNull();
  });
  it("rejects an empty or blank name", () => {
    expect(validateRegistration(form({ name: "" }), at("18:00"))).toEqual({
      ok: false,
      errors: { name: "Enter the patient's name or initials." },
    });
    expect(validateRegistration(form({ name: "   " }), at("18:00")).ok).toBe(false);
  });
  it("allows exactly 80 characters but not 81", () => {
    expect(validateRegistration(form({ name: "x".repeat(80) }), at("18:00")).ok).toBe(true);
    const result = validateRegistration(form({ name: "x".repeat(81) }), at("18:00"));
    expect(result).toEqual({ ok: false, errors: { name: "Keep the name to 80 characters or fewer." } });
  });
  it("needs a time for a booked patient", () => {
    expect(validateRegistration(form({ kind: "booked" }), at("18:00"))).toEqual({
      ok: false,
      errors: { bookedTime: "Enter the booked time." },
    });
  });
  it("rejects a type or urgency that isn't one of the choices", () => {
    expect(validateRegistration(form({ kind: "vip", urgency: "5" }), at("18:00"))).toEqual({
      ok: false,
      errors: { kind: "Choose walk-in or booked.", urgency: "Choose an urgency level." },
    });
  });
  it("reports every problem at once, so the receptionist fixes them in one go", () => {
    const result = validateRegistration(form({ name: "", kind: "booked", urgency: "" }), at("18:00"));
    expect(result.ok === false && Object.keys(result.errors).sort()).toEqual(["bookedTime", "name", "urgency"]);
  });
});
