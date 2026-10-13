import { expect, test } from "@playwright/test";
import { DOCTOR, RECEPTION, fitsScreen, signIn, withWindows } from "./helpers";

// ST-05 (BRD traceability): US-5 patient status page by link or QR, without signing in.

test("ST-05.1 a patient opens their link without signing in and sees their place, but no names", async ({ browser }) => {
  test.setTimeout(60_000);
  await withWindows(browser, async (open) => {
    const reception = await open();
    await signIn(reception, RECEPTION);
    await expect(reception).toHaveURL(/\/reception$/);
    await reception.getByLabel("Patient name or initials").fill("E2E test patient");
    await reception.getByRole("button", { name: "Register and issue token" }).click();
    const token = (await reception.getByTestId("issued-token").textContent())!.trim();
    const link = await reception.getByRole("link", { name: "Open status page" }).getAttribute("href");

    // A fresh browser with no session: the patient's phone.
    const phone = await open();
    const startedAt = Date.now();
    await phone.goto(link!);
    await expect(phone.getByTestId("status-token")).toHaveText(token);
    test.info().annotations.push({ type: "load", description: `${((Date.now() - startedAt) / 1000).toFixed(1)} s` });

    await expect(phone.getByTestId("status-message")).toContainText(/ahead of you|You are next/);
    // The step-out advice (UT-24) is always shown while waiting.
    await expect(phone.getByText(/You can step out|Please come back to the waiting room now|Please stay in the waiting room/)).toBeVisible();
    await expect(phone.getByText("E2E test patient")).toHaveCount(0); // NFR-4: no names on public pages
    await expect(phone.getByTestId("live-status")).toHaveAttribute("data-state", "live");
    expect(await fitsScreen(phone), "page must not be wider than the screen").toBe(true);

  });
});

test("ST-05.2 a wrong or shortened link says the token wasn't found", async ({ page }) => {
  await page.goto(`/status/${"0".repeat(32)}`);
  await expect(page.getByRole("heading", { name: "We couldn't find this token" })).toBeVisible();
  await page.goto("/status/abc");
  await expect(page.getByRole("heading", { name: "We couldn't find this token" })).toBeVisible();
});

test("ST-05.3 when the doctor calls the patient, the whole phone screen says Please go in now", async ({ browser }, info) => {
  test.skip(info.project.name !== "phone-375", "A phone screen; one run on the phone view is enough");
  test.setTimeout(90_000);
  await withWindows(browser, async (open) => {
    const reception = await open();
    await signIn(reception, RECEPTION);
    await expect(reception).toHaveURL(/\/reception$/);
    await reception.getByLabel("Patient name or initials").fill("E2E test patient");
    await reception.getByText("Emergency", { exact: true }).click();
    await reception.getByRole("button", { name: "Register and issue token" }).click();
    const token = (await reception.getByTestId("issued-token").textContent())!.trim();
    const link = await reception.getByRole("link", { name: "Open status page" }).getAttribute("href");

    const phone = await open();
    await phone.setViewportSize({ width: 375, height: 760 });
    await phone.goto(link!);
    await expect(phone.getByTestId("live-status")).toHaveAttribute("data-state", "live");

    // The doctor calls patients until this one is called (an earlier emergency may be first).
    const doctor = await open();
    await signIn(doctor, DOCTOR);
    await expect(doctor).toHaveURL(/\/doctor$/);
    for (let i = 0; i < 5; i++) {
      await doctor.getByRole("button", { name: /^Call A-/ }).click();
      const called = (await doctor.getByText(/^A-\d+ called$/).last().textContent())!.replace(" called", "");
      if (called === token) break;
    }

    const alert = phone.getByRole("alert").filter({ hasText: "Please go in now" });
    await expect(alert).toBeVisible({ timeout: 10_000 });
    await phone.waitForTimeout(700); // after the slide-in
    const box = await alert.boundingBox();
    expect(box!.width).toBe(375);
    expect(box!.height).toBe(760);
  });
});
