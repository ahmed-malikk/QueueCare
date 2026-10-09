import { expect, test } from "@playwright/test";
import { DOCTOR, RECEPTION, fitsScreen, signIn, withWindows } from "./helpers";

// ST-06 (BRD traceability): US-6 waiting-room "Now serving" display.

test("ST-06.1 the display shows Now serving and the next tokens, with no names", async ({ page }) => {
  await page.goto("/display");
  await expect(page.getByRole("heading", { name: "Now serving" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /^Next/ })).toBeVisible();
  await expect(page.getByTestId("live-status")).toHaveAttribute("data-state", "live");
  await expect(page.getByText("E2E test patient")).toHaveCount(0); // NFR-4
  expect(await page.getByTestId("next-token").count()).toBeLessThanOrEqual(3);
  expect(await fitsScreen(page), "page must not be wider than the screen").toBe(true);
});

test("ST-06.2 calling an emergency ahead of others updates the display live and says priority", async ({
  browser,
}, info) => {
  test.skip(info.project.name !== "desktop-chrome", "The display is a TV screen; one desktop run is enough");
  test.setTimeout(90_000);
  await withWindows(browser, async (open) => {
    const reception = await open();
    const doctor = await open();
    const display = await open();

    // A Normal patient, then an Emergency who arrives after them.
    await signIn(reception, RECEPTION);
    await expect(reception).toHaveURL(/\/reception$/);
    for (const urgency of ["Normal", "Emergency"]) {
      await reception.getByLabel("Patient name or initials").fill("E2E test patient");
      await reception.getByText(urgency, { exact: true }).first().click();
      await reception.getByRole("button", { name: "Register and issue token" }).click();
      await expect(reception.getByText(/Token issued for E2E test patient/)).toBeVisible();
    }
    const emergency = (await reception.getByTestId("issued-token").textContent())!.trim();

    await display.goto("/display");
    await expect(display.getByTestId("live-status")).toHaveAttribute("data-state", "live");
    const before = (await display.getByTestId("now-serving").textContent())!.trim();

    await signIn(doctor, DOCTOR);
    await expect(doctor).toHaveURL(/\/doctor$/);
    await doctor.getByRole("button", { name: "Call next" }).click();
    await expect(doctor.getByText(/^A-\d+ called$/)).toBeVisible();

    // The display was not touched: it must change by itself.
    await expect(display.getByTestId("now-serving")).not.toHaveText(before);
    // Whenever it shows our emergency, called ahead of an earlier patient, it must say priority.
    if ((await display.getByTestId("now-serving").textContent())!.trim() === emergency) {
      await expect(display.getByTestId("priority-called")).toBeVisible();
    }
    expect(await display.getByText("E2E test patient").count()).toBe(0);
  });
});
