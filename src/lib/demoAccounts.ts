/**
 * The public demo logins, so anyone reviewing the project can try both staff roles.
 * Deliberately public (also in the README): they only reach demo data.
 */
export const DEMO_ACCOUNTS = {
  receptionist: { label: "Try as Reception", email: "reception@queuecare.demo", password: "QueueCare-Reception-1" },
  doctor: { label: "Try as Doctor", email: "doctor@queuecare.demo", password: "QueueCare-Doctor-1" },
} as const;

export type DemoRole = keyof typeof DEMO_ACCOUNTS;
