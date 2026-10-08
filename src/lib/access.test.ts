import { describe, expect, it } from "vitest";
import { checkAccess, homeFor, requiredRole } from "./access";

describe("UT-09 homeFor: where each role lands after signing in", () => {
  it("sends a receptionist to the reception desk", () => {
    expect(homeFor("receptionist")).toBe("/reception");
  });
  it("sends a doctor to the doctor's screen", () => {
    expect(homeFor("doctor")).toBe("/doctor");
  });
  it("sends a patient account, or nobody, to the home page", () => {
    expect(homeFor("patient")).toBe("/");
    expect(homeFor(null)).toBe("/");
  });
});

describe("UT-10 requiredRole: which role a page needs", () => {
  it("staff areas need their own role, including pages inside them", () => {
    expect(requiredRole("/reception")).toBe("receptionist");
    expect(requiredRole("/reception/new")).toBe("receptionist");
    expect(requiredRole("/doctor")).toBe("doctor");
    expect(requiredRole("/doctor/history")).toBe("doctor");
  });
  it("public pages need no role", () => {
    expect(requiredRole("/")).toBeNull();
    expect(requiredRole("/login")).toBeNull();
    expect(requiredRole("/status/abc123")).toBeNull();
  });
  it("a page that only starts with the same letters is not a staff area", () => {
    expect(requiredRole("/doctors-on-duty")).toBeNull();
    expect(requiredRole("/receptionist")).toBeNull();
  });
});

describe("UT-11 checkAccess: let in, or send somewhere else", () => {
  it("anyone can open public pages", () => {
    expect(checkAccess("/", null)).toEqual({ allow: true });
    expect(checkAccess("/status/abc123", "doctor")).toEqual({ allow: true });
    expect(checkAccess("/login", null)).toEqual({ allow: true });
  });
  it("signed-out visitors are sent to sign in", () => {
    expect(checkAccess("/reception", null)).toEqual({ allow: false, redirectTo: "/login" });
    expect(checkAccess("/doctor/history", null)).toEqual({ allow: false, redirectTo: "/login" });
  });
  it("staff open their own screens", () => {
    expect(checkAccess("/reception", "receptionist")).toEqual({ allow: true });
    expect(checkAccess("/doctor", "doctor")).toEqual({ allow: true });
  });
  it("staff are sent back to their own screen from the other role's screen", () => {
    expect(checkAccess("/doctor", "receptionist")).toEqual({ allow: false, redirectTo: "/reception" });
    expect(checkAccess("/reception/new", "doctor")).toEqual({ allow: false, redirectTo: "/doctor" });
  });
  it("a patient account can't open staff screens", () => {
    expect(checkAccess("/reception", "patient")).toEqual({ allow: false, redirectTo: "/" });
  });
  it("signed-in staff who open the sign-in page go straight to their screen", () => {
    expect(checkAccess("/login", "receptionist")).toEqual({ allow: false, redirectTo: "/reception" });
    expect(checkAccess("/login", "doctor")).toEqual({ allow: false, redirectTo: "/doctor" });
  });
});
