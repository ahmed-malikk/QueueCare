/**
 * QueueCare access rules: who may open which page, and where everyone else is sent.
 * Pure logic, no cookies or database, so it can be tested on its own. The proxy
 * (src/proxy.ts) and every staff page (src/lib/dal.ts) use these same rules.
 *
 * Rules (from the PRD, US-1):
 *   1. /reception and the pages inside it are for receptionists; /doctor and its pages are for doctors.
 *   2. Signed-out visitors who try a staff page are sent to sign in.
 *   3. Staff who open the other role's page are sent back to their own screen.
 *   4. Everything else is public (the home page, sign-in, a patient's status link).
 */

export type Role = "patient" | "receptionist" | "doctor";

/** Either "come in", or "not here: go to redirectTo". */
export type Access = { allow: true } | { allow: false; redirectTo: string };

export const LOGIN_PATH = "/login";

/** Each staff area and the one role allowed in it. */
const STAFF_AREAS: { prefix: string; role: Role }[] = [
  { prefix: "/reception", role: "receptionist" },
  { prefix: "/doctor", role: "doctor" },
];

/** Task 1: the page a role lands on after signing in. Patients and signed-out visitors go home ("/"). */
export function homeFor(role: Role | null): string {
  if (role === "receptionist") return "/reception";
  if (role === "doctor") return "/doctor";
  return "/";
}

/** Task 2: the role a page needs, or null if the page is public. */
export function requiredRole(pathname: string): Role | null {
  for (const area of STAFF_AREAS) {
    const exact = pathname === area.prefix;
    const inside = pathname.startsWith(area.prefix + "/");
    if (exact || inside) return area.role;
  }
  return null;
}

/** Task 3: may this visitor (role null = signed out) open this page? */
export function checkAccess(pathname: string, role: Role | null): Access {
  const required = requiredRole(pathname);
  if (required === null) {
    // Signed-in staff don't need the sign-in form again: send them to their own screen.
    if (pathname === LOGIN_PATH && (role === "receptionist" || role === "doctor")) {
      return { allow: false, redirectTo: homeFor(role) };
    }
    return { allow: true };
  }
  if (role === null) {
    return { allow: false, redirectTo: LOGIN_PATH };
  }
  if (role !== required) {
    return { allow: false, redirectTo: homeFor(role) };
  }
  return { allow: true };
}
