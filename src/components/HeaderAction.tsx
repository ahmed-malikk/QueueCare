"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, House, Stethoscope, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LOGIN_PATH, homeFor, requiredRole, type Role } from "@/lib/access";

/**
 * The button on the right of the header.
 * - On the sign-in page and on staff screens: a way home.
 * - On public pages, signed-in staff: a shortcut back to their own screen.
 * - On public pages, everyone else: "Staff", which leads to sign-in.
 * A Client Component, because only the browser knows which page is open after navigating.
 * The role comes from the server (SiteHeader), which reads the sign-in cookie.
 */
export function HeaderAction({ role }: { role: Role | null }) {
  const pathname = usePathname();

  if (pathname === LOGIN_PATH || requiredRole(pathname) !== null) {
    return (
      <Button asChild variant="outline">
        <Link href="/">
          <House /> Home
        </Link>
      </Button>
    );
  }

  if (role === "receptionist" || role === "doctor") {
    const Icon = role === "doctor" ? Stethoscope : ClipboardList;
    return (
      <Button asChild variant="outline">
        <Link href={homeFor(role)}>
          <Icon /> {role === "doctor" ? "Doctor's screen" : "Reception desk"}
        </Link>
      </Button>
    );
  }

  return (
    <Button asChild variant="outline">
      <Link href={LOGIN_PATH}>
        <UserRound /> Staff
      </Link>
    </Button>
  );
}
