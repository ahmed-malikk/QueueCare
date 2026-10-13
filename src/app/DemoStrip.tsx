import { ArrowLeftRight, ExternalLink } from "lucide-react";
import { switchDemoRole } from "./login/actions";

const linkClass =
  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-semibold text-primary underline decoration-[#9db3a6] underline-offset-4 transition-colors hover:bg-card hover:decoration-primary";

/**
 * Shortcuts for the public demo accounts only (never for a real clinic): switch to the other
 * role, and open the screens that need no sign-in in new tabs, so a reviewer can watch every
 * screen update live side by side. A browser can only be signed in as one role at a time.
 */
export function DemoStrip({
  role,
  lastPatient,
}: {
  role: "receptionist" | "doctor";
  lastPatient?: { token: string; statusPath: string } | null;
}) {
  return (
    <div aria-label="Demo shortcuts" role="region" className="mt-4 rounded-xl border bg-[#e9f0f2]">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-3 py-2 text-sm">
        <span className="mr-2 font-semibold text-foreground">Demo account</span>
        <form action={switchDemoRole}>
          <button type="submit" className={linkClass}>
            <ArrowLeftRight className="size-4" aria-hidden="true" />
            {role === "receptionist" ? "Switch to the doctor" : "Switch to reception"}
          </button>
        </form>
        <a href="/display" target="_blank" rel="noreferrer" className={linkClass}>
          Open the waiting-room screen <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
        {lastPatient && (
          <a href={lastPatient.statusPath} target="_blank" rel="noreferrer" className={linkClass}>
            Open {lastPatient.token}&apos;s phone page <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
}
