"use client";

import { useActionState } from "react";
import { CircleAlert, Loader2, LogIn } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, type SignInState } from "./actions";

const initialState: SignInState = { error: null };

// Public demo logins, so anyone reviewing the project can try both roles.
const DEMO_ACCOUNTS = [
  { label: "Try the demo as reception", hint: "Register patients and set urgency", email: "reception@queuecare.demo", password: "QueueCare-Reception-1" },
  { label: "Try the demo as the doctor", hint: "Call the next patient", email: "doctor@queuecare.demo", password: "QueueCare-Doctor-1" },
];

/** Fills the sign-in form with a demo account and moves focus to the Sign in button. */
function fillDemo(email: string, password: string) {
  const form = document.getElementById("sign-in-form") as HTMLFormElement | null;
  if (!form) return;
  (form.elements.namedItem("email") as HTMLInputElement).value = email;
  (form.elements.namedItem("password") as HTMLInputElement).value = password;
  form.querySelector<HTMLButtonElement>("button[type=submit]")?.focus();
}

export function DemoAccounts() {
  return (
    <div className="grid gap-3">
      {DEMO_ACCOUNTS.map((account) => (
        <button
          key={account.label}
          type="button"
          onClick={() => fillDemo(account.email, account.password)}
          className="group flex items-center justify-between rounded-2xl bg-primary px-5 py-4 text-left text-primary-foreground transition-[translate,scale,box-shadow,background-color] duration-200 ease-(--ease-out-soft) hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_14px_26px_-16px_rgb(30_59_44/0.7)] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          <span>
            <span className="block text-base font-semibold">{account.label}</span>
            <span className="block text-sm opacity-80">{account.hint}</span>
          </span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="size-6 transition-transform duration-200 group-hover:translate-x-1.5 motion-reduce:transition-none">
            <path d="M4 12h15M13 6l6 6-6 6" />
          </svg>
        </button>
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
