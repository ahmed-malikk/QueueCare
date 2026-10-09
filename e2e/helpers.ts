import type { Browser, BrowserContext, Page } from "@playwright/test";

// Public demo logins (also on the sign-in page and in the README).
export const RECEPTION = { email: "reception@queuecare.demo", password: "QueueCare-Reception-1" };
export const DOCTOR = { email: "doctor@queuecare.demo", password: "QueueCare-Doctor-1" };

export async function signIn(page: Page, account: { email: string; password: string }) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Password").fill(account.password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

/** True if the page is no wider than the screen (no sideways scrolling). */
export async function fitsScreen(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
}

/**
 * Runs a test that needs several separate browser windows (e.g. reception, doctor, patient),
 * and always closes them afterwards, even if the test fails. Open windows keep a live
 * connection and refresh themselves, so leaving them open slows down every later test.
 */
export async function withWindows(browser: Browser, run: (open: () => Promise<Page>) => Promise<void>) {
  const contexts: BrowserContext[] = [];
  const open = async () => {
    const context = await browser.newContext();
    contexts.push(context);
    return context.newPage();
  };
  try {
    await run(open);
  } finally {
    // Close one at a time; if a window doesn't close within 5 s, give up on it (the browser is
    // closed at the end of the run anyway) rather than letting cleanup fail a passing test.
    for (const context of contexts) {
      await Promise.race([context.close(), new Promise((resolve) => setTimeout(resolve, 5_000))]);
    }
  }
}
