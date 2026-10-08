"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/dal";
import { homeFor } from "@/lib/access";

export type SignInState = { error: string | null };

/** Runs on the server when the sign-in form is submitted. */
export async function signIn(_previous: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  // One message for every failure, so the form doesn't reveal which emails have accounts.
  if (error) return { error: "That email and password don't match a staff account." };

  const user = await getCurrentUser();
  if (user?.role !== "receptionist" && user?.role !== "doctor") {
    await supabase.auth.signOut();
    return { error: "This account isn't a staff account." };
  }
  redirect(homeFor(user.role));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
