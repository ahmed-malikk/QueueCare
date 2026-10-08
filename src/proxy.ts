import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { LOGIN_PATH, requiredRole } from "@/lib/access";

/**
 * Runs before every page. It does two jobs:
 *   1. Keeps the sign-in session fresh (Supabase sessions expire; the refreshed cookies are
 *      copied onto the response).
 *   2. A quick first check: signed-out visitors can't even start loading a staff page.
 * The role check happens on the page itself (src/lib/dal.ts), and the database's
 * row-level security is the final guard.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        },
      },
    },
  );

  // Checks the session token and refreshes it if needed. Keep this call directly after
  // creating the client.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);

  if (!signedIn && requiredRole(request.nextUrl.pathname) !== null) {
    const redirect = NextResponse.redirect(new URL(LOGIN_PATH, request.url));
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  }

  return response;
}

export const config = {
  // Every page except Next.js internals and static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
