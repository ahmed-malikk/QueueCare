import Link from "next/link";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/login/actions";
import { getCurrentUser } from "@/lib/dal";
import { homeFor } from "@/lib/access";

const SCREEN_NAMES = { receptionist: "Reception desk", doctor: "Doctor's screen" } as const;

/** Links for visitors. Also in the footer, because they are hidden on narrow screens. */
export const PUBLIC_LINKS = [
  { href: "/#order", label: "Queue rules" },
  { href: "https://github.com/ahmed-malikk/QueueCare#readme", label: "How this was built", external: true },
] as const;

/**
 * The bar at the top of every page. It reads the sign-in cookie on the server, so it knows who
 * is looking: signed-in staff see a link to their own screen and Sign out (never a prompt to
 * sign in again); everyone else sees the public links and "Staff sign in".
 */
export async function SiteHeader() {
  const user = await getCurrentUser();
  const staffRole = user?.role === "receptionist" || user?.role === "doctor" ? user.role : null;

  return (
    <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/75">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link href="/" aria-label="QueueCare home" className="mr-auto">
          <Logo />
        </Link>

        {staffRole ? (
          <nav aria-label="Staff" className="flex items-center gap-2 sm:gap-3">
            <Link
              href={homeFor(staffRole)}
              className="rounded-md px-2 py-1 text-sm font-medium text-foreground underline-offset-4 hover:underline"
            >
              {SCREEN_NAMES[staffRole]}
            </Link>
            <span className="hidden max-w-[22ch] truncate text-sm text-muted-foreground md:inline">{user?.email}</span>
            <form action={signOut}>
              <Button type="submit" variant="outline">
                <LogOut /> Sign out
              </Button>
            </form>
          </nav>
        ) : (
          <nav aria-label="Main" className="flex items-center gap-6">
            <ul className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
              {PUBLIC_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="underline-offset-4 hover:text-foreground hover:underline"
                    {...("external" in link ? { target: "_blank", rel: "noreferrer" } : {})}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <Button asChild>
              <Link href="/login">Staff sign in</Link>
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}
