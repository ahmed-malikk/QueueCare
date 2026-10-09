import { expect, test } from "@playwright/test";
import { RECEPTION, fitsScreen, signIn } from "./helpers";

// ST-05 (BRD traceability): US-5 patient status page by link or QR, without signing in.

test("ST-05.1 a patient opens their link without signing in and sees their place, but no names", async ({ browser }) => {
  test.setTimeout(60_000);
  const receptionContext = await browser.newContext();
  const reception = await receptionContext.newPage();
  await signIn(reception, RECEPTION);
  await expect(reception).toHaveURL(/\/reception$/);
  await reception.getByLabel("Patient name or initials").fill("E2E test patient");
  await reception.getByRole("button", { name: "Register and issue token" }).click();
  const token = (await reception.getByTestId("issued-token").textContent())!.trim();
  const link = await reception.getByRole("link", { name: "Open status page" }).getAttribute("href");

  // A fresh browser with no session: the patient's phone.
  const phoneContext = await browser.newContext();
  const phone = await phoneContext.newPage();
  const startedAt = Date.now();
  await phone.goto(link!);
  await expect(phone.getByTestId("status-token")).toHaveText(token);
  test.info().annotations.push({ type: "load", description: `${((Date.now() - startedAt) / 1000).toFixed(1)} s` });

  await expect(phone.getByTestId("status-message")).toContainText(/ahead of you|You are next/);
  await expect(phone.getByText("E2E test patient")).toHaveCount(0); // NFR-4: no names on public pages
  await expect(phone.getByTestId("live-status")).toHaveAttribute("data-state", "live");
  expect(await fitsScreen(phone), "page must not be wider than the screen").toBe(true);

  await phoneContext.close();
  await receptionContext.close();
});

test("ST-05.2 a wrong or shortened link says the token wasn't found", async ({ page }) => {
  await page.goto(`/status/${"0".repeat(32)}`);
  await expect(page.getByRole("heading", { name: "We couldn't find this token" })).toBeVisible();
  await page.goto("/status/abc");
  await expect(page.getByRole("heading", { name: "We couldn't find this token" })).toBeVisible();
});
