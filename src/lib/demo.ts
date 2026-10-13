/**
 * The public demo accounts, so anyone reviewing QueueCare can try both staff roles.
 * The logins are deliberately public (they are in the README too). Real clinic accounts
 * never see demo shortcuts: only emails on the demo domain count as demo accounts.
 */
import type { Role } from "./access";

export const DEMO_DOMAIN = "@queuecare.demo";

export type StaffRole = Extract<Role, "receptionist" | "doctor">;

export const DEMO_ACCOUNTS: Record<StaffRole, { email: string; password: string }> = {
  receptionist: { email: "reception@queuecare.demo", password: "QueueCare-Reception-1" },
  doctor: { email: "doctor@queuecare.demo", password: "QueueCare-Doctor-1" },
};

/** True only for the public demo accounts (case and surrounding spaces don't matter). */
export function isDemoEmail(email: string | null | undefined): boolean {
  return typeof email === "string" && email.trim().toLowerCase().endsWith(DEMO_DOMAIN);
}

/** The other staff role, for the demo's "switch" shortcut. */
export function otherRole(role: StaffRole): StaffRole {
  return role === "receptionist" ? "doctor" : "receptionist";
}
