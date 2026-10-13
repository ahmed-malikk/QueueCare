"use client";

import { useTransition } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { callNext } from "./actions";

/**
 * The doctor's one button. It says exactly what one press will do: who it calls ("Call A-09")
 * and who is marked finished. Disabled while saving, so a double press can't call two patients.
 */
export function CallNextButton({ next, current }: { next: string | null; current: string | null }) {
  const [pending, startTransition] = useTransition();

  const title = next ? `Call ${next}` : current ? `Finish ${current}` : "Nobody is waiting";
  const detail = next
    ? current
      ? `${current} will be marked finished`
      : "First patient of the evening"
    : current
      ? "Nobody else is waiting"
      : "New patients appear here";

  function press() {
    startTransition(async () => {
      const result = await callNext();
      if (!result.ok) toast.error(result.message);
      else if (result.called) toast.success(`${result.called} called`);
      else toast.success("Patient finished. Nobody is waiting.");
    });
  }

  return (
    <button
      type="button"
      onClick={press}
      disabled={pending || (!next && !current)}
      className="group mt-3.5 flex h-[76px] w-full items-center justify-between rounded-[20px] bg-primary px-[26px] text-left text-primary-foreground transition-[translate,scale,box-shadow,background-color,opacity] duration-200 ease-(--ease-out-soft) outline-none hover:enabled:-translate-y-[3px] hover:enabled:bg-primary-hover hover:enabled:shadow-[0_18px_30px_-16px_rgb(30_59_44/0.7)] focus-visible:ring-3 focus-visible:ring-ring/50 active:enabled:scale-[0.99] active:enabled:shadow-none disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-wait aria-busy:opacity-85 motion-reduce:transition-none motion-reduce:hover:enabled:translate-y-0"
      aria-busy={pending}
    >
      <span>
        <span className="block text-[21px] font-semibold">{pending ? (next ? `Calling ${next}…` : "Finishing…") : title}</span>
        <span className="block text-[13px] opacity-80">{detail}</span>
      </span>
      {pending ? (
        <Loader2 className="size-7 animate-spin" aria-hidden="true" />
      ) : next ? (
        <ArrowRight className="size-7 transition-transform duration-200 group-hover:translate-x-1.5 motion-reduce:transition-none" strokeWidth={1.6} aria-hidden="true" />
      ) : current ? (
        <Check className="size-7" aria-hidden="true" />
      ) : null}
    </button>
  );
}
