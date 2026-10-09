import { expect, test } from "@playwright/test";
import { DOCTOR, RECEPTION, fitsScreen, signIn } from "./helpers";

// ST-04 (BRD traceability): US-4 the doctor calls the next patient; every screen updates live.
// The three browser runs share one demo queue, so these tests check what must hold whoever
// presses first: the called patient leaves the waiting list everywhere, without a reload.

test("ST-04.1 Call next brings in a patient and every open screen updates live", async ({ browser }) => {
  test.setTimeout(60_000); // two sign-ins, a registration and a call, each crossing to Mumbai
  const receptionContext = await browser.newContext();
  const doctorContext = await browser.newContext();
  const reception = await receptionContext.newPage();
  const doctor = await doctorContext.newPage();

  // Reception registers a patient, so there is always someone to call.
  await signIn(reception, RECEPTION);
  await expect(reception).toHaveURL(/\/reception$/);
  await reception.getByLabel("Patient name or initials").fill("E2E test patient");
  await reception.getByRole("button", { name: "Register and issue token" }).click();
  await expect(reception.getByTestId("issued-token")).toBeVisible();
  await expect(reception.getByTestId("live-status")).toHaveAttribute("data-state", "live");

  await signIn(doctor, DOCTOR);
  await expect(doctor).toHaveURL(/\/doctor$/);
  await expect(doctor.getByTestId("live-status")).toHaveAttribute("data-state", "live");

  const pressedAt = Date.now();
  await doctor.getByRole("button", { name: "Call next" }).click();
  const toast = doctor.getByText(/^A-\d+ called$/);
  await expect(toast).toBeVisible();
  const savedAt = Date.now(); // the doctor sees the call confirmed: the change is in the database
  const called = (await toast.textContent())!.replace(" called", "");

  // The reception window was not touched: the called patient must disappear by itself.
  await expect(reception.getByTestId(`queue-row-${called}`)).toHaveCount(0, { timeout: 10_000 });
  const spread = (Date.now() - savedAt) / 1000;
  const total = (Date.now() - pressedAt) / 1000;
  const timing = `${spread.toFixed(1)} s after saving, ${total.toFixed(1)} s after the click`;
  test.info().annotations.push({ type: "live update", description: timing });
  console.log(`[${test.info().project.name}] live update: ${timing}`);

  // NFR-6 (other screens update within 2 seconds) is measured on the deployed site, where the
  // server runs next to the database. Locally every database round trip crosses the internet
  // from this PC to Mumbai (0.2–1.5 s measured), so only a looser bound is checked here.
  const limit = process.env.E2E_BASE_URL ? 2 : 6;
  expect(spread, `other screens update within ${limit} s of the change`).toBeLessThanOrEqual(limit);

  await receptionContext.close();
  await doctorContext.close();
});

test("ST-04.2 the doctor's screen shows who is with them and fits the screen", async ({ page }) => {
  await signIn(page, DOCTOR);
  await expect(page).toHaveURL(/\/doctor$/);
  await expect(page.getByRole("heading", { name: "With you now" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Next up" })).toBeVisible();
  expect(await fitsScreen(page), "page must not be wider than the screen").toBe(true);
});
