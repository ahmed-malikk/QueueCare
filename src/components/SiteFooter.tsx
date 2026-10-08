import { LogoMark } from "@/components/Logo";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-2">
          <LogoMark className="size-5" />
          QueueCare · live clinic queue
        </span>
        <a
          href="https://github.com/ahmed-malikk/QueueCare"
          className="hover:text-foreground"
          target="_blank"
          rel="noreferrer"
        >
          Source on GitHub
        </a>
      </div>
    </footer>
  );
}
