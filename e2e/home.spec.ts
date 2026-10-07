import { expect, test } from "@playwright/test";

test("ST-00 home page loads and fits the screen", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "QueueCare", level: 1 })).toBeVisible();
  const { scroll, viewport } = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(scroll, "page must not be wider than the screen").toBeLessThanOrEqual(viewport);
});
