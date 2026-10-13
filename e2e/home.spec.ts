import { expect, test } from "@playwright/test";
import { DOCTOR, RECEPTION, signIn } from "./helpers";

test("ST-00 home page loads, shows the logo and fits the screen", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("The paper token");
  await expect(page.getByRole("link", { name: "QueueCare home" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "How the order is decided" })).toBeVisible();

  const { scroll, viewport } = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(scroll, "page must not be wider than the screen").toBeLessThanOrEqual(viewport);
});

test("ST-00.1 the browser tab icon is the QueueCare logo", async ({ request }) => {
  const icon = await request.get("/icon.svg");
  expect(icon.ok()).toBe(true);
  expect(icon.headers()["content-type"]).toContain("svg");
});

test("ST-00.2 visitors see Staff sign in, and the logo leads home", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Staff sign in" }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.getByRole("link", { name: "QueueCare home" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("button", { name: "Sign out" })).toHaveCount(0);
});

test("ST-00.3 staff screens have one header: their screen and Sign out, no sign-in prompt", async ({ page }) => {
  await signIn(page, RECEPTION);
  await expect(page).toHaveURL(/\/reception$/);
  const header = page.getByRole("banner");
  // The screen name sits beside the logo (hidden on narrow phones, as in the design).
  await expect(header.getByText("Reception desk")).toHaveCount(1);
  await expect(header.getByRole("button", { name: "Sign out" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Staff sign in" })).toHaveCount(0);
  // The old second bar is gone: exactly one Sign out button on the page.
  await expect(page.getByRole("button", { name: "Sign out" })).toHaveCount(1);
});

test("ST-00.4 signed-in staff on the home page are offered their screen, not sign-in", async ({ page }) => {
  await signIn(page, DOCTOR);
  await expect(page).toHaveURL(/\/doctor$/);
  await page.getByRole("link", { name: "QueueCare home" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("link", { name: "Staff sign in" })).toHaveCount(0);
  await page.getByRole("banner").getByRole("link", { name: "Doctor's screen" }).click();
  await expect(page).toHaveURL(/\/doctor$/);
});

test("ST-00.5 after signing out the header offers sign-in again", async ({ page }) => {
  await signIn(page, RECEPTION);
  await expect(page).toHaveURL(/\/reception$/);
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  // The sign-in page's header is just the logo.
  await expect(page.getByRole("button", { name: "Sign out" })).toHaveCount(0);
  await page.getByRole("link", { name: "QueueCare home" }).click();
  await expect(page.getByRole("link", { name: "Staff sign in" })).toBeVisible();
});
