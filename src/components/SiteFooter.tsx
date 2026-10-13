"use client";

import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import { requiredRole } from "@/lib/access";
import { PUBLIC_LINKS } from "@/lib/links";

/** The footer on public pages. Staff screens leave it out, as in the approved design. */
export function SiteFooter() {
  const pathname = usePathname();
  if (requiredRole(pathname) !== null) return null;

  return (
    <footer className="mt-auto border-t bg-card">
      <div className="mx-auto flex max-w-[80rem] flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span className="inline-flex items-center gap-2 text-primary">
          <LogoMark className="size-5" />
          <span className="text-muted-foreground">QueueCare, a live queue for small clinics</span>
        </span>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {PUBLIC_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="hover:text-foreground"
                {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
