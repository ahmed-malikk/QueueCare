import Link from "next/link";
import { Logo } from "@/components/Logo";

/** The bar at the top of every page. `actions` holds page-specific buttons on the right. */
export function SiteHeader({ actions }: { actions?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-card/85 backdrop-blur supports-[backdrop-filter]:bg-card/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" aria-label="QueueCare home">
          <Logo />
        </Link>
        {actions && <nav className="flex items-center gap-2">{actions}</nav>}
      </div>
    </header>
  );
}
