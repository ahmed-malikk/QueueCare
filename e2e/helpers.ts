import type { Page } from "@playwright/test";

// Public demo logins (also on the sign-in page and in the README).
export const RECEPTION = { email: "reception@queuecare.demo", password: "QueueCare-Reception-1" };
export const DOCTOR = { email: "doctor@queuecare.demo", password: "QueueCare-Doctor-1" };

export async function signIn(page: Page, account: { email: string; password: string }) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Password").fill(account.password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

/** True if the page is no wider than the screen (no sideways scrolling). */
export async function fitsScreen(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
}
