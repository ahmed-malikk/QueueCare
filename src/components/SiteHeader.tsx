import { getCurrentUser } from "@/lib/dal";
import { isDemoEmail } from "@/lib/demo";
import { getLastRegisteredToday } from "@/lib/queueData";
import { formatToken } from "@/lib/registration";
import { createClient } from "@/lib/supabase/server";
import { HeaderBar } from "./HeaderBar";

/**
 * The bar at the top of every page. This part runs on the server and reads the sign-in cookie,
 * so it knows who is looking; HeaderBar (in the browser) knows which page is open and draws
 * the right version. Live refreshes re-run this, so the demo strip's "last patient" stays current.
 */
export async function SiteHeader() {
  const user = await getCurrentUser();
  const role = user?.role === "receptionist" || user?.role === "doctor" ? user.role : null;
  const demo = role !== null && isDemoEmail(user?.email);

  let lastPatient: { token: string; statusPath: string } | null = null;
  if (demo && role === "receptionist") {
    const last = await getLastRegisteredToday(await createClient(), new Date());
    if (last) lastPatient = { token: formatToken(last.tokenNumber), statusPath: `/status/${last.publicCode}` };
  }

  return <HeaderBar staff={role ? { role, demo } : null} lastPatient={lastPatient} />;
}
