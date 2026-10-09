import { expect, test } from "@playwright/test";
import { RECEPTION, fitsScreen, signIn } from "./helpers";

// ST-02 (BRD traceability): US-2 register a patient and issue a token.
// Visits are never deleted, so ST-02.1 adds one Normal "E2E test patient" per browser per run.
// Normal, so test patients never jump ahead of real ones; they drop out of the queue at the end
// of the clinic day, and #12 (estimated vs actual) must leave rows named "E2E test patient" out.

test.beforeEach(async ({ page }) => {
  await signIn(page, RECEPTION);
  await expect(page).toHaveURL(/\/reception$/);
});

test("ST-02.1 registering a walk-in issues a token with a QR code, ready for the next patient", async ({ page }) => {
  const name = page.getByLabel("Patient name or initials");
  await expect(name).toBeFocused();
  await name.fill("E2E test patient");
  await page.getByRole("button", { name: "Register and issue token" }).click();

  await expect(page.getByTestId("issued-token")).toHaveText(/^A-\d+$/);
  await expect(page.getByText("Token issued for E2E test patient")).toBeVisible();
  await expect(page.getByRole("img", { name: /QR code for token A-\d+/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open status page" })).toHaveAttribute("href", /\/status\/[0-9a-f]{32}$/);

  // The form is blank again, back to the defaults, with the cursor in the name box.
  await expect(name).toHaveValue("");
  await expect(name).toBeFocused();
  await expect(page.getByRole("radio", { name: "Normal" })).toBeChecked();
});

test("ST-02.2 an empty name is rejected and nothing is issued", async ({ page }) => {
  await page.getByRole("button", { name: "Register and issue token" }).click();
  await expect(page.getByText("Enter the patient's name or initials.")).toBeVisible();
  await expect(page.getByTestId("issued-token")).toHaveCount(0);
});

test("ST-02.3 a booked patient needs a time, and the typed name is kept", async ({ page }) => {
  await expect(page.getByLabel("Booked time")).toHaveCount(0);
  await page.getByLabel("Patient name or initials").fill("Booked test");
  await page.getByText("Booked", { exact: true }).click();
  await expect(page.getByLabel("Booked time")).toBeVisible();

  await page.getByRole("button", { name: "Register and issue token" }).click();
  await expect(page.getByText("Enter the booked time.")).toBeVisible();
  await expect(page.getByLabel("Patient name or initials")).toHaveValue("Booked test");
  await expect(page.getByTestId("issued-token")).toHaveCount(0);
});

test("ST-02.4 the reception desk fits the screen", async ({ page }) => {
  expect(await fitsScreen(page), "page must not be wider than the screen").toBe(true);
});
