import { expect, test } from "@playwright/test";

test("ST-00 home page loads, shows the logo and fits the screen", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Urgent patients first");
  await expect(page.getByRole("link", { name: "QueueCare home" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "How it works" })).toBeVisible();

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
