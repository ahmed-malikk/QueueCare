import { LogoMark } from "@/components/Logo";
import { PUBLIC_LINKS } from "@/components/SiteHeader";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-2">
          <LogoMark className="size-5" />
          QueueCare, a live queue for small clinics
        </span>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {PUBLIC_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="hover:text-foreground"
                {...("external" in link ? { target: "_blank", rel: "noreferrer" } : {})}
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
