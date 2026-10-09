"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { URGENCY_NAMES } from "@/lib/queueView";
import { changeUrgency } from "./actions";

const SELECTED = [
  "border-primary bg-secondary text-secondary-foreground",
  "border-urgent bg-urgent-soft text-urgent",
  "border-emergency bg-emergency-soft text-emergency",
];

/** Three small buttons on each queue row. The current urgency is pressed. */
export function UrgencyControl({ visitId, token, urgency }: { visitId: string; token: string; urgency: number }) {
  const [pending, startTransition] = useTransition();

  function choose(level: number) {
    if (level === urgency) return;
    startTransition(async () => {
      const result = await changeUrgency(visitId, level);
      if (result.ok) toast.success(`${token} is now ${URGENCY_NAMES[level]}`);
      else toast.error(result.message);
    });
  }

  return (
    <div role="group" aria-label={`Urgency for ${token}`} className="flex items-center gap-1">
      {URGENCY_NAMES.map((name, level) => (
        <button
          key={name}
          type="button"
          aria-pressed={level === urgency}
          disabled={pending}
          onClick={() => choose(level)}
          className={cn(
            "h-8 rounded-md border px-2.5 text-xs font-medium transition-colors outline-none",
            "focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-wait disabled:opacity-60",
            level === urgency ? SELECTED[level] : "bg-card text-muted-foreground hover:bg-muted",
          )}
        >
          {name}
        </button>
      ))}
      {pending && <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="Saving" />}
    </div>
  );
}
