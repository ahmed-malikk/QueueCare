"use client";

import { useTransition } from "react";
import { DropdownMenu } from "radix-ui";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { URGENCY_NAMES } from "@/lib/queueView";
import { changeUrgency } from "./actions";

/** Badge colours by the patient's level right now (which waiting may have raised). */
const LEVEL_STYLE = [
  "bg-secondary text-primary",
  "bg-urgent-soft text-urgent",
  "bg-emergency-soft text-emergency",
];
const DOT = ["bg-primary", "bg-[#f2b544]", "bg-emergency"];

/**
 * One badge per queue row showing the patient's urgency ("Normal", "Urgent", "Emergency" or
 * "Raised to Urgent"). Tapping it opens a menu to change it. Radix gives the menu its keyboard
 * support: arrow keys move, Enter picks, Escape closes and focus returns to the badge.
 */
export function UrgencyControl({
  visitId,
  token,
  urgency,
  level,
  label,
}: {
  visitId: string;
  token: string;
  urgency: number; // what reception set
  level: number; // what counts now (waiting can raise it)
  label: string;
}) {
  const [pending, startTransition] = useTransition();

  function choose(value: string) {
    const next = Number(value);
    if (next === urgency) return;
    startTransition(async () => {
      const result = await changeUrgency(visitId, next);
      if (result.ok) toast.success(`${token} is now ${URGENCY_NAMES[next]}`);
      else toast.error(result.message);
    });
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild disabled={pending}>
        <button
          type="button"
          data-slot="badge"
          aria-label={`Urgency for ${token}: ${label}. Change`}
          className={cn(
            "group inline-flex h-9 items-center gap-1.5 rounded-full border-[1.5px] border-transparent px-3 text-[13px] font-semibold whitespace-nowrap outline-none",
            "transition-[scale,border-color] duration-200 ease-(--ease-out-soft) hover:scale-[1.06] hover:border-current active:scale-95",
            "focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-wait disabled:opacity-70 motion-reduce:transition-none motion-reduce:hover:scale-100",
            LEVEL_STYLE[level],
          )}
        >
          <span aria-hidden="true">{label}</span>
          {pending ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <ChevronDown
              className="size-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
              aria-hidden="true"
            />
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-[190px] rounded-xl border bg-card p-1.5 shadow-[0_18px_40px_-16px_rgb(22_32_26/0.35)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98] data-[state=open]:slide-in-from-top-1.5 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 motion-reduce:animate-none"
        >
          <DropdownMenu.Label className="px-3 pt-1.5 pb-1 text-xs text-muted-foreground">
            Urgency for {token}
          </DropdownMenu.Label>
          <DropdownMenu.RadioGroup value={String(urgency)} onValueChange={choose}>
            {URGENCY_NAMES.map((name, index) => (
              <DropdownMenu.RadioItem
                key={name}
                value={String(index)}
                className="flex h-11 cursor-pointer items-center justify-between gap-2.5 rounded-lg px-3 font-semibold outline-none select-none data-[highlighted]:bg-background"
              >
                <span className="flex items-center gap-2.5">
                  <span className={cn("size-2.5 rounded-full", DOT[index])} aria-hidden="true" />
                  {name}
                </span>
                <DropdownMenu.ItemIndicator>
                  <Check className="size-4" aria-hidden="true" />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
