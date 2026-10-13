import { expect, test } from "@playwright/test";
import { RECEPTION, signIn } from "./helpers";

// ST-08: the demo shortcuts strip (issue #28). Demo accounts only.

test("ST-08.1 the demo strip switches between reception and the doctor", async ({ page }) => {
  await signIn(page, RECEPTION);
  await expect(page).toHaveURL(/\/reception$/);
  const strip = page.getByRole("region", { name: "Demo shortcuts" });
  await expect(strip).toBeVisible();

  await strip.getByRole("button", { name: "Switch to the doctor" }).click();
  await expect(page).toHaveURL(/\/doctor$/);
  await expect(page.getByRole("banner").getByText("Doctor's screen")).toHaveCount(1);

  await page.getByRole("region", { name: "Demo shortcuts" }).getByRole("button", { name: "Switch to reception" }).click();
  await expect(page).toHaveURL(/\/reception$/);
});

test("ST-08.2 the strip opens the waiting-room screen and the last patient's page in new tabs", async ({ page }) => {
  await signIn(page, RECEPTION);
  await expect(page).toHaveURL(/\/reception$/);
  await page.getByLabel("Patient name or initials").fill("E2E test patient");
  await page.getByRole("button", { name: /Register and issue token/ }).click();
  const token = (await page.getByTestId("issued-token").textContent())?.trim();

  const strip = page.getByRole("region", { name: "Demo shortcuts" });
  const tv = strip.getByRole("link", { name: /waiting-room screen/ });
  await expect(tv).toHaveAttribute("href", "/display");
  await expect(tv).toHaveAttribute("target", "_blank");

  const phone = strip.getByRole("link", { name: `Open ${token}'s phone page` });
  await expect(phone).toHaveAttribute("target", "_blank");
  const [patient] = await Promise.all([page.context().waitForEvent("page"), phone.click()]);
  await expect(patient.getByTestId("status-token")).toHaveText(token!);
  await patient.close();
});
