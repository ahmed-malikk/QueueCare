import { expect, test } from "@playwright/test";
import { RECEPTION, signIn } from "./helpers";

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

test("ST-00.2 the header offers a way home from the sign-in page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Staff", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);

  await expect(page.getByRole("link", { name: "Staff", exact: true })).toHaveCount(0);
  await page.getByRole("link", { name: "Home", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("link", { name: "Staff", exact: true })).toBeVisible();
});

test("ST-00.3 staff screens show a Home button in the header", async ({ page }) => {
  await signIn(page, RECEPTION);
  await expect(page).toHaveURL(/\/reception$/);
  await expect(page.getByRole("link", { name: "Home", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Staff", exact: true })).toHaveCount(0);
});

test("ST-00.4 signed-in staff see a shortcut to their screen instead of Staff", async ({ page }) => {
  await signIn(page, RECEPTION);
  await expect(page).toHaveURL(/\/reception$/);
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Staff", exact: true })).toHaveCount(0);
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Reception desk" }).click();
  await expect(page).toHaveURL(/\/reception$/);
});

test("ST-00.5 'Try the reception desk' signs in with the demo account in one step", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Try the reception desk" }).click();
  await expect(page).toHaveURL(/\/reception$/);
  await expect(page.getByRole("heading", { name: "Reception desk" })).toBeVisible();
});

test("ST-00.6 the example queue report shows an emergency arriving, and replays it", async ({ page }) => {
  await page.goto("/");
  const report = page.getByRole("figure").filter({ hasText: "Queue report" });
  const firstToken = report.locator("tbody tr").first().locator(".token-type");
  // The demo starts when the report is on screen (on a phone it is below the fold).
  await report.scrollIntoViewIfNeeded();
  await expect(firstToken).toHaveText("A-16");
  await expect(report).toContainText("20–35");

  await page.getByRole("button", { name: "Watch an emergency arrive" }).click();
  await expect(firstToken).toHaveText("A-3");
  await expect(firstToken).toHaveText("A-16");
});
