"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LOGIN_PATH, requiredRole } from "@/lib/access";

/**
 * The button on the right of the header. On the sign-in page and on staff screens it offers a
 * way home; on public pages a "Staff" button leads to sign-in (signed-in staff go on to their screen).
 * A Client Component, because only the browser knows which page is open after navigating.
 */
export function HeaderAction() {
  const pathname = usePathname();

  // Home on the sign-in page and on every staff screen (which only signed-in staff can reach).
  if (pathname === LOGIN_PATH || requiredRole(pathname) !== null) {
    return (
      <Button asChild variant="outline">
        <Link href="/">
          <House /> Home
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
