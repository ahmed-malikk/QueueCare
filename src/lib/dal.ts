import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkAccess, type Role } from "@/lib/access";

export type Staff = { id: string; email: string; role: Role };

/**
 * Who is signed in, and their role from the profiles table (or null if nobody is).
 * `cache` means one page render asks the database only once, however many components call it.
 */
export const getCurrentUser = cache(async (): Promise<Staff | null> => {
  const supabase = await createClient();
  // Checks the login token's signature (ES256) here, without a network trip, so a forged or
  // expired cookie fails. Faster than getUser(), which asks the Auth server every time.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", claims.sub).single();
  return { id: claims.sub, email: typeof claims.email === "string" ? claims.email : "", role: (profile?.role ?? "patient") as Role };
});

/**
 * Call at the top of every staff page with that page's path. Sends anyone who
 * shouldn't be there somewhere else, using the same rules as the unit tests.
 */
export async function requireAccess(pathname: string): Promise<Staff> {
  const user = await getCurrentUser();
  const access = checkAccess(pathname, user?.role ?? null);
  if (!access.allow) redirect(access.redirectTo);
  return user!;
}
