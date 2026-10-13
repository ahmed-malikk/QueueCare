"use client";

import { useActionState } from "react";
import { CircleAlert, Loader2, LogIn } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signInAsDemo, type SignInState } from "./actions";

const initialState: SignInState = { error: null };

const DEMO_TILES = [
  { role: "receptionist", label: "Try the demo as reception", hint: "Register patients and set urgency" },
  { role: "doctor", label: "Try the demo as the doctor", hint: "Call the next patient" },
] as const;

/** One demo tile: a one-click sign-in as that role (the logins stay on the server). */
function DemoTile({ role, label, hint }: (typeof DEMO_TILES)[number]) {
  const [state, action, pending] = useActionState(signInAsDemo.bind(null, role), initialState);
  return (
    <form action={action}>
      <button
        type="submit"
        disabled={pending}
        className="group flex w-full items-center justify-between rounded-2xl bg-primary px-5 py-4 text-left text-primary-foreground transition-[translate,scale,box-shadow,background-color] duration-200 ease-(--ease-out-soft) hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_14px_26px_-16px_rgb(30_59_44/0.7)] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:scale-[0.98] disabled:cursor-wait disabled:opacity-80 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <span>
          <span className="block text-base font-semibold">{label}</span>
          <span className="block text-sm opacity-80">{pending ? "Signing in…" : hint}</span>
        </span>
        {pending ? (
          <Loader2 className="size-6 animate-spin" aria-hidden="true" />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="size-6 transition-transform duration-200 group-hover:translate-x-1.5 motion-reduce:transition-none">
            <path d="M4 12h15M13 6l6 6-6 6" />
          </svg>
        )}
      </button>
      {state.error && <p role="alert" className="mt-2 text-sm text-destructive">{state.error}</p>}
    </form>
  );
}

export function DemoAccounts() {
  return (
    <div className="grid gap-3">
      {DEMO_TILES.map((tile) => (
        <DemoTile key={tile.role} {...tile} />
      ))}
    </div>
  );
}

export function SignInForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form id="sign-in-form" action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="username" required className="h-11" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required className="h-11" />
      </div>

      {state.error && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" size="lg" className="mt-1 h-12 w-full text-base" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <LogIn />}
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
