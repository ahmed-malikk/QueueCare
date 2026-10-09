"use client";

import { useTransition } from "react";
import { BellRing, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { callNext } from "./actions";

/** The doctor's one button. Disabled while saving, so a double press can't call two patients. */
export function CallNextButton({ hasWaiting, hasCurrent }: { hasWaiting: boolean; hasCurrent: boolean }) {
  const [pending, startTransition] = useTransition();
  const label = hasWaiting ? "Call next" : "Finish current patient";

  function press() {
    startTransition(async () => {
      const result = await callNext();
      if (!result.ok) toast.error(result.message);
      else if (result.called) toast.success(`${result.called} called`);
      else toast.success("Patient finished. Nobody is waiting.");
    });
  }

  return (
    <Button size="lg" className="h-14 w-full text-lg" disabled={pending || (!hasWaiting && !hasCurrent)} onClick={press}>
      {pending ? <Loader2 className="animate-spin" /> : <BellRing />}
      {pending ? "Calling…" : label}
    </Button>
  );
}
