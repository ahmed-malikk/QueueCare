import Link from "next/link";
import { Logo } from "@/components/Logo";
import { HeaderAction } from "@/components/HeaderAction";
import { getCurrentUser } from "@/lib/dal";

/** The bar at the top of every page: the logo (a link home) and one action button. */
export async function SiteHeader() {
  // Who is signed in decides the button on public pages ("Staff" only for signed-out visitors).
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b bg-card/85 backdrop-blur supports-[backdrop-filter]:bg-card/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" aria-label="QueueCare home">
          <Logo />
        </Link>
        <nav aria-label="Main">
          <HeaderAction role={user?.role ?? null} />
        </nav>
      </div>
    </header>
  );
}
