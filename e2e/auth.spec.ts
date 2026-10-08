import { expect, test, type Page } from "@playwright/test";

// ST-01 (BRD traceability): US-1 staff sign-in with roles.

// Public demo logins (also listed on the sign-in page and in the README).
const RECEPTION = { email: "reception@queuecare.demo", password: "QueueCare-Reception-1" };
const DOCTOR = { email: "doctor@queuecare.demo", password: "QueueCare-Doctor-1" };

async function signIn(page: Page, account: { email: string; password: string }) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Password").fill(account.password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("ST-01.1 signed-out visitors are sent to sign in from staff screens", async ({ page }) => {
  await page.goto("/reception");
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/doctor");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Staff sign-in" })).toBeVisible();
});

test("ST-01.2 a wrong password shows an error and stays on sign-in", async ({ page }) => {
  await signIn(page, { email: RECEPTION.email, password: "not-the-password" });
  await expect(page.getByRole("alert").filter({ hasText: "don't match" })).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("ST-01.3 the receptionist lands on reception and can't open the doctor's screen", async ({ page }) => {
  await signIn(page, RECEPTION);
  await expect(page).toHaveURL(/\/reception$/);
  await expect(page.getByRole("heading", { name: "Reception desk" })).toBeVisible();

  await page.goto("/doctor");
  await expect(page).toHaveURL(/\/reception$/);

  // Already signed in, so the sign-in page sends them back to their screen.
  await page.goto("/login");
  await expect(page).toHaveURL(/\/reception$/);
});

test("ST-01.4 the doctor lands on the doctor's screen and can't open reception", async ({ page }) => {
  await signIn(page, DOCTOR);
  await expect(page).toHaveURL(/\/doctor$/);
  await expect(page.getByRole("heading", { name: "Doctor's screen" })).toBeVisible();

  await page.goto("/reception");
  await expect(page).toHaveURL(/\/doctor$/);
});

test("ST-01.5 signing out locks the staff screens again", async ({ page }) => {
  await signIn(page, DOCTOR);
  await expect(page).toHaveURL(/\/doctor$/);
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.goto("/doctor");
  await expect(page).toHaveURL(/\/login$/);
});

test("ST-01.6 the sign-in page fits the screen", async ({ page }) => {
  await page.goto("/login");
  const { scroll, viewport } = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(scroll, "page must not be wider than the screen").toBeLessThanOrEqual(viewport);
});

test("ST-01.7 the demo buttons fill in a demo login", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Try as Reception" }).click();
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/reception$/);
});
