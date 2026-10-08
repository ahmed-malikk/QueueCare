"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LOGIN_PATH } from "@/lib/access";

/**
 * The button on the right of the header. On the sign-in page it offers a way home;
 * everywhere else a "Staff" button leads to sign-in (signed-in staff are sent on to their own screen).
 * A Client Component, because only the browser knows which page is open after navigating.
 */
export function HeaderAction() {
  const pathname = usePathname();

  if (pathname === LOGIN_PATH) {
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
