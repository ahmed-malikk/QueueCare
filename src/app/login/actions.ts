"use server";

import { redirect } from "next/navigation";
import type { AuthError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/dal";
import { homeFor } from "@/lib/access";
import { DEMO_ACCOUNTS, type DemoRole } from "@/lib/demoAccounts";

export type SignInState = { error: string | null };

/**
 * What to tell the person when sign-in fails. A wrong email and a wrong password get the same
 * message, so the form doesn't reveal which emails have accounts. Other failures say what to do.
 */
function signInErrorMessage(error: AuthError): string {
  if (error.code === "invalid_credentials") return "That email and password don't match a staff account.";
  if (error.code === "over_request_rate_limit" || error.status === 429) {
    return "Too many sign-in attempts. Wait a minute, then try again.";
  }
  console.error("Sign-in failed:", error.status, error.code, error.message);
  if (!error.status || error.status >= 500) return "Couldn't reach the sign-in service. Check the connection and try again.";
  return "That email and password don't match a staff account.";
}

/** Runs on the server when the sign-in form is submitted. */
export async function signIn(_previous: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: signInErrorMessage(error) };

  const user = await getCurrentUser();
  if (user?.role !== "receptionist" && user?.role !== "doctor") {
    await supabase.auth.signOut({ scope: "local" });
    return { error: "This account isn't a staff account." };
  }
  redirect(homeFor(user.role));
}

/**
 * The home page's "Try" buttons: sign in with a public demo account in one step.
 * If that fails (say the sign-in service is down), the sign-in page explains and offers the form.
 */
export async function signInAsDemo(role: DemoRole) {
  const account = DEMO_ACCOUNTS[role];
  if (!account) redirect("/login");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: account.email, password: account.password });
  if (error) {
    console.error("Demo sign-in failed:", error.status, error.code, error.message);
    redirect("/login");
  }
  redirect(homeFor(role));
}

export async function signOut() {
  const supabase = await createClient();
  // Only this browser: the default ("global") would sign the account out on every device.
  await supabase.auth.signOut({ scope: "local" });
  redirect("/login");
}
