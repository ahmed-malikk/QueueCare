import { expect, test } from "@playwright/test";
import { DOCTOR, RECEPTION, signIn } from "./helpers";

test("ST-00 home page loads, shows the logo and fits the screen", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Keep the paper token");
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

test("ST-00.2 visitors see Staff sign in, and sign-in has a clear way back", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Staff sign in" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole("link", { name: "Back to home" }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/login");

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

test("ST-00.6 Try the live demo signs in as reception in one click", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Try the live demo/ }).click();
  await expect(page).toHaveURL(/\/reception$/);
});

test("ST-00.7 the menu has only links that go somewhere useful", async ({ page }) => {
  await page.goto("/");
  const menu = page.getByRole("navigation", { name: "Main" });
  for (const name of ["How it works", "Queue rules", "Results"]) {
    await expect(menu.getByRole("link", { name })).toHaveCount(0);
  }
  await expect(page.getByRole("link", { name: "How this was built" }).first()).toHaveAttribute("href", /github\.com/);
});

test("ST-00.8 rows in the home animation stay on one line, even with an Emergency tag", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/");
  await expect(page.locator('[data-id="queue"] [data-token="A-15"]')).toBeVisible({ timeout: 40_000 });
  await page.waitForTimeout(1500); // let the row finish gliding into place
  const heights = await page
    .locator('[data-id="queue"] li')
    .evaluateAll((rows) => rows.map((row) => Math.round(row.getBoundingClientRect().height)));
  // One line is about 37 px; a wrapped "Walk-in" made the row about 55 px.
  for (const height of heights) expect(height).toBeLessThan(45);
});
