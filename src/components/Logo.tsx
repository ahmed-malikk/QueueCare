import { cn } from "@/lib/utils";

/**
 * The QueueCare mark: a "Q" whose tail is a medical cross (queue + care).
 * The same drawing is the browser tab icon (src/app/icon.svg).
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-8", className)}>
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <circle cx="14.5" cy="14.5" r="7" fill="none" stroke="white" strokeWidth="3" />
      {/* A teal outline under the cross leaves a small gap where it meets the ring. */}
      <path d="M22.5 18v9M18 22.5h9" className="stroke-primary" strokeWidth="6.5" strokeLinecap="round" />
      <path d="M22.5 18v9M18 22.5h9" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** The mark plus the name, for the header and footer. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="text-lg font-semibold tracking-tight">
        Queue<span className="text-primary">Care</span>
      </span>
    </span>
  );
}
