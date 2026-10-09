import { expect, test } from "@playwright/test";
import { RECEPTION, fitsScreen, signIn } from "./helpers";

// ST-03 (BRD traceability): US-3 change a patient's urgency.
// Each run registers one Normal "E2E test patient" per browser (visits are never deleted) and
// always sets it back to Normal, so test patients never stay ahead of real ones.

test.beforeEach(async ({ page }) => {
  await signIn(page, RECEPTION);
  await expect(page).toHaveURL(/\/reception$/);
});

test("ST-03.1 raising a patient to Emergency moves them up the queue at once", async ({ page }) => {
  await page.getByLabel("Patient name or initials").fill("E2E test patient");
  await page.getByRole("button", { name: "Register and issue token" }).click();
  const token = (await page.getByTestId("issued-token").textContent())!.trim();

  const row = page.getByTestId(`queue-row-${token}`);
  await expect(row).toBeVisible(); // the new patient appears in today's queue straight away
  await expect(row.getByText("Normal", { exact: true }).first()).toBeVisible();
  const positionBefore = Number(await row.getByLabel(/^Position/).textContent());

  try {
    await row.getByRole("button", { name: "Emergency" }).click();
    await expect(row.getByRole("button", { name: "Emergency" })).toHaveAttribute("aria-pressed", "true");
    await expect(row.locator('[data-slot="badge"]')).toHaveText("Emergency");
    const positionAfter = Number(await row.getByLabel(/^Position/).textContent());
    expect(positionAfter).toBeLessThanOrEqual(positionBefore);
    // The other two browsers may each have an Emergency test patient at the same moment, so a strict
    // move up is only certain when there were more than 3 patients ahead. Ordering itself is UT-18.
    if (positionBefore > 3) expect(positionAfter).toBeLessThan(positionBefore);
  } finally {
    await row.getByRole("button", { name: "Normal" }).click();
    await expect(row.getByRole("button", { name: "Normal" })).toHaveAttribute("aria-pressed", "true");
  }
});

test("ST-03.2 the reception desk with a long queue still fits the screen", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Today's queue" })).toBeVisible();
  expect(await fitsScreen(page), "page must not be wider than the screen").toBe(true);
});
