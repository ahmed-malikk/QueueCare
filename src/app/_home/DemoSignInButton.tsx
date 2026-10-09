"use client";

import { useFormStatus } from "react-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** The submit button of a demo sign-in form: shows that it's working while the sign-in runs. */
export function DemoSignInButton({
  label,
  pendingLabel,
  tone = "default",
}: {
  label: string;
  pendingLabel: string;
  tone?: "default" | "outline";
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      variant={tone}
      disabled={pending}
      className="h-12 px-6 text-base"
    >
      {pending ? <Loader2 className="animate-spin" /> : null}
      {pending ? pendingLabel : label}
      {pending ? null : <ArrowRight />}
    </Button>
  );
}
