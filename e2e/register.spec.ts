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
  await expect(page.getByText("Token for E2E test patient")).toBeVisible();
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

test("ST-02.6 reception can show a waiting patient's QR code again from the queue", async ({ page }) => {
  await page.getByLabel("Patient name or initials").fill("E2E test patient");
  await page.getByRole("button", { name: "Register and issue token" }).click();
  const token = (await page.getByTestId("issued-token").textContent())!.trim();

  await page.getByTestId(`queue-row-${token}`).getByRole("button", { name: `Show QR code for ${token}` }).click();
  const dialog = page.getByRole("dialog", { name: token });
  await expect(dialog).toBeVisible();
  const statusPath = await dialog.getByRole("img", { name: `QR code for token ${token}` }).getAttribute("data-status-path");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);

  // The code in the dialog belongs to this patient: it opens their own status page.
  await page.goto(statusPath!);
  await expect(page.getByTestId("status-token")).toHaveText(token);
});

test("ST-02.7 Print token prints a slip with only the token, wait and QR code", async ({ page }) => {
  // Don't open the real print dialog; count the calls instead. The page itself must be the one
  // that prints, straight from the tap (a hidden frame is blocked on phones, #44).
  await page.addInitScript(() => {
    (window as unknown as { __prints: number }).__prints = 0;
    window.print = () => {
      (window as unknown as { __prints: number }).__prints++;
    };
  });
  await page.reload();
  await page.getByLabel("Patient name or initials").fill("E2E test patient");
  await page.getByRole("button", { name: "Register and issue token" }).click();
  const token = (await page.getByTestId("issued-token").textContent())!.trim();

  await page.getByRole("button", { name: "Print token" }).first().click();
  expect(await page.evaluate(() => (window as unknown as { __prints: number }).__prints)).toBe(1);

  // What the printer gets: the page as it looks in print media.
  await page.emulateMedia({ media: "print" });
  const slip = page.locator("[data-printing]");
  await expect(slip).toBeVisible();
  const printed = await slip.innerText();
  expect(printed).toContain(token);
  expect(printed).toContain("Scan to follow your place in the queue");
  expect(await slip.locator("svg").count()).toBe(1); // the QR code
  expect(printed).not.toContain("E2E test patient"); // no names on the slip
  await expect(page.getByText("Today's queue")).toBeHidden(); // nothing else from the screen
  await expect(page.getByRole("button", { name: "Register and issue token" })).toBeHidden();
  const width = await slip.evaluate((el) => el.getBoundingClientRect().width);
  expect(width).toBeGreaterThan(0);
});
