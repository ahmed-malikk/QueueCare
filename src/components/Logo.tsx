import { cn } from "@/lib/utils";

/**
 * The QueueCare mark: a "Q" whose tail is a medical cross (queue + care).
 * Drawn in the current text colour, so it works on light and dark screens.
 * The same drawing is the browser tab icon (src/app/icon.svg).
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={cn("size-7", className)}>
      <circle cx="18" cy="18" r="12" fill="none" stroke="currentColor" strokeWidth="5" />
      <path d="M27 25h4v4h4v4h-4v4h-4v-4h-4v-4h4z" fill="currentColor" />
    </svg>
  );
}

/** The mark plus the name, for the header and footer. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-primary", className)}>
      <LogoMark />
      <span className="text-[1.45rem] leading-none tracking-tight">QueueCare</span>
    </span>
  );
}
