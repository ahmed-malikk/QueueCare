"use client";

import { useActionState, useRef } from "react";
import { CircleAlert, Loader2, LogIn } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { signIn, type SignInState } from "./actions";

const initialState: SignInState = { error: null };

// Public demo logins, so anyone reviewing the project can try both roles.
const DEMO_ACCOUNTS = [
  { label: "Try as Reception", email: "reception@queuecare.demo", password: "QueueCare-Reception-1" },
  { label: "Try as Doctor", email: "doctor@queuecare.demo", password: "QueueCare-Doctor-1" },
];

export function SignInForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  function fillDemo(email: string, password: string) {
    if (emailRef.current) emailRef.current.value = email;
    if (passwordRef.current) passwordRef.current.value = password;
    passwordRef.current?.focus();
  }

  return (
    <div className="grid gap-5">
      <form action={formAction} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input ref={emailRef} id="email" name="email" type="email" autoComplete="username" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            ref={passwordRef}
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        {state.error && (
          <Alert variant="destructive">
            <CircleAlert />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <LogIn />}
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Separator className="flex-1" />
        or try a demo account
        <Separator className="flex-1" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {DEMO_ACCOUNTS.map((account) => (
          <Button
            key={account.label}
            type="button"
            variant="outline"
            onClick={() => fillDemo(account.email, account.password)}
          >
            {account.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
