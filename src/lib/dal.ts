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
  const { data: auth } = await supabase.auth.getUser(); // asks Supabase, so a forged cookie fails
  if (!auth.user) return null;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", auth.user.id).single();
  return { id: auth.user.id, email: auth.user.email ?? "", role: (profile?.role ?? "patient") as Role };
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
