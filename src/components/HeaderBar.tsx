"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight, ExternalLink, Monitor } from "lucide-react";
import { Logo } from "@/components/Logo";
import { LiveRefresh } from "@/components/LiveRefresh";
import { Button } from "@/components/ui/button";
import { signOut, switchDemoRole } from "@/app/login/actions";
import { LOGIN_PATH, homeFor, requiredRole } from "@/lib/access";
import { PUBLIC_LINKS } from "@/lib/links";

type Staff = { role: "receptionist" | "doctor"; demo: boolean };

const SCREEN_NAMES = { receptionist: "Reception desk", doctor: "Doctor's screen" } as const;

const stripLink =
  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-semibold text-primary underline decoration-[#9db3a6] underline-offset-[3px] transition-[background-color,translate] duration-200 hover:-translate-y-px hover:bg-card motion-reduce:hover:translate-y-0";

/**
 * Three versions, as in the approved design:
 *   - staff screens: logo | screen name, then Live, (reception) Waiting-room screen, Sign out;
 *     demo accounts also get the shortcuts strip underneath
 *   - the sign-in page: just the logo
 *   - everywhere else: logo, public links, and Staff sign in (or, for signed-in staff, their screen)
 */
export function HeaderBar({
  staff,
  lastPatient,
}: {
  staff: Staff | null;
  lastPatient: { token: string; statusPath: string } | null;
}) {
  const pathname = usePathname();
  const onStaffScreen = staff !== null && requiredRole(pathname) === staff.role;

  return (
    <header className="sticky top-0 z-40">
      <div className="flex min-h-[4.5rem] flex-wrap items-center gap-x-4 gap-y-2 border-b bg-card px-4 py-3 sm:px-6">
        <Link href="/" aria-label="QueueCare home">
          <Logo />
        </Link>

        {staff && onStaffScreen ? (
          <>
            <span className="hidden border-l pl-4 text-sm text-muted-foreground sm:inline">
              {SCREEN_NAMES[staff.role]}
            </span>
            <nav aria-label="Staff" className="ml-auto flex items-center gap-2.5">
              <LiveRefresh />
              {staff.role === "receptionist" && (
                <Button asChild variant="ghost" className="h-11">
                  <a href="/display" target="_blank" rel="noreferrer" aria-label="Open the waiting-room screen">
                    <Monitor /> <span className="hidden md:inline">Waiting-room screen</span>
                  </a>
                </Button>
              )}
              <form action={signOut}>
                <Button type="submit" variant="outline" className="h-11 border-primary px-4 font-semibold text-primary">
                  Sign out
                </Button>
              </form>
            </nav>
          </>
        ) : pathname === LOGIN_PATH ? null : (
          <nav aria-label="Main" className="ml-auto flex items-center gap-6">
            <ul className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
              {PUBLIC_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="underline-offset-4 hover:text-foreground hover:underline"
                    {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <Button asChild className="h-11 px-4 font-semibold">
              {staff ? (
                <Link href={homeFor(staff.role)}>{SCREEN_NAMES[staff.role]}</Link>
              ) : (
                <Link href={LOGIN_PATH}>Staff sign in</Link>
              )}
            </Button>
          </nav>
        )}
      </div>

      {staff && onStaffScreen && staff.demo && (
        <div role="region" aria-label="Demo shortcuts" className="border-b bg-[#e9f0f2]">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 px-4 py-2 text-[13px] sm:px-6">
            <span className="mr-2 font-semibold text-primary">Demo account</span>
            <form action={switchDemoRole}>
              <button type="submit" className={stripLink}>
                <ArrowLeftRight className="size-3.5" aria-hidden="true" />
                {staff.role === "receptionist" ? "Switch to the doctor" : "Switch to reception"}
              </button>
            </form>
            <a href="/display" target="_blank" rel="noreferrer" className={stripLink}>
              Open the waiting-room screen <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
            {staff.role === "receptionist" && lastPatient && (
              <a href={lastPatient.statusPath} target="_blank" rel="noreferrer" className={stripLink}>
                Open {lastPatient.token}&apos;s phone page <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
