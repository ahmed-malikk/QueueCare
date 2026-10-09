"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CircleAlert, Loader2, Ticket } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { registerPatient, type RegisterState } from "./actions";
import { TokenCard } from "./TokenCard";

const initialState: RegisterState = { attempt: 0, errors: {}, message: null, values: null, issued: null };

const KINDS = [
  { value: "walk_in", label: "Walk-in" },
  { value: "booked", label: "Booked" },
];

const URGENCIES = [
  { value: "0", label: "Normal", checked: "peer-checked:border-primary peer-checked:bg-secondary peer-checked:text-secondary-foreground" },
  { value: "1", label: "Urgent", checked: "peer-checked:border-urgent peer-checked:bg-urgent-soft peer-checked:text-urgent" },
  { value: "2", label: "Emergency", checked: "peer-checked:border-emergency peer-checked:bg-emergency-soft peer-checked:text-emergency" },
];

/** One button in a segmented choice: a real radio input, styled as a big tappable tile. */
function Choice(props: {
  name: string;
  value: string;
  label: string;
  defaultChecked: boolean;
  checkedClass?: string;
  onSelect?: (value: string) => void;
}) {
  return (
    <label className="relative flex-1">
      <input
        type="radio"
        name={props.name}
        value={props.value}
        defaultChecked={props.defaultChecked}
        onChange={() => props.onSelect?.(props.value)}
        className="peer sr-only"
      />
      <span
        className={cn(
          "flex h-11 cursor-pointer items-center justify-center rounded-lg border bg-card px-3 text-sm font-medium transition-colors",
          "hover:bg-muted peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50",
          props.checkedClass ?? "peer-checked:border-primary peer-checked:bg-secondary peer-checked:text-secondary-foreground",
        )}
      >
        {props.label}
      </span>
    </label>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-sm text-destructive">
      {message}
    </p>
  );
}

/**
 * The fields. Re-created (via `key`) after every submit: blank after a success, holding
 * what was typed after an error.
 */
function Fields({ state }: { state: RegisterState }) {
  const values = state.values;
  const [kind, setKind] = useState(values?.kind ?? "walk_in");
  const nameRef = useRef<HTMLInputElement>(null);

  // Ready for the next patient straight away.
  useEffect(() => nameRef.current?.focus(), []);

  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="name">Patient name or initials</Label>
        <Input
          ref={nameRef}
          id="name"
          name="name"
          defaultValue={values?.name ?? ""}
          maxLength={80}
          autoComplete="off"
          aria-invalid={Boolean(state.errors.name)}
          aria-describedby={state.errors.name ? "name-error" : undefined}
        />
        <FieldError id="name-error" message={state.errors.name} />
      </div>

      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-medium">Type</legend>
        <div className="flex gap-2">
          {KINDS.map((option) => (
            <Choice
              key={option.value}
              name="kind"
              value={option.value}
              label={option.label}
              defaultChecked={kind === option.value}
              onSelect={setKind}
            />
          ))}
        </div>
        <FieldError id="kind-error" message={state.errors.kind} />
      </fieldset>

      {kind === "booked" && (
        <div className="grid gap-2">
          <Label htmlFor="bookedTime">Booked time</Label>
          <Input
            id="bookedTime"
            name="bookedTime"
            type="time"
            defaultValue={values?.bookedTime ?? ""}
            className="w-40"
            aria-invalid={Boolean(state.errors.bookedTime)}
            aria-describedby={state.errors.bookedTime ? "bookedTime-error" : undefined}
          />
          <FieldError id="bookedTime-error" message={state.errors.bookedTime} />
        </div>
      )}

      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-medium">Urgency</legend>
        <div className="flex gap-2">
          {URGENCIES.map((option) => (
            <Choice
              key={option.value}
              name="urgency"
              value={option.value}
              label={option.label}
              defaultChecked={(values?.urgency ?? "0") === option.value}
              checkedClass={option.checked}
            />
          ))}
        </div>
        <FieldError id="urgency-error" message={state.errors.urgency} />
      </fieldset>
    </>
  );
}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerPatient, initialState);

  // A small confirmation, in case the receptionist is looking at the patient, not the screen.
  useEffect(() => {
    if (state.issued && !state.values) toast.success(`Token ${state.issued.token} issued`);
  }, [state]);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_20rem]">
      <section aria-labelledby="register-heading" className="rounded-lg border bg-card p-5 sm:p-6">
        <h2 id="register-heading" className="text-xl font-bold tracking-tight">
          Register a patient
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">The next token number is given automatically.</p>
        <form action={formAction} noValidate className="mt-5 grid gap-5">
          <Fields key={state.attempt} state={state} />

          {state.message && (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto sm:justify-self-start">
            {pending ? <Loader2 className="animate-spin" /> : <Ticket />}
            {pending ? "Registering…" : "Register and issue token"}
          </Button>
        </form>
      </section>

      {state.issued ? (
        <TokenCard key={state.issued.token} issued={state.issued} />
      ) : (
        // Keeps the layout steady on wide screens until the first token is issued.
        <div className="hidden min-h-80 flex-col items-center justify-center gap-1 rounded-sm border-2 border-dashed border-slip-edge px-6 text-center lg:flex">
          <p className="token-type text-7xl text-slip-edge" aria-hidden="true">
            A-
          </p>
          <p className="mt-2 text-sm text-muted-foreground">The next token and its QR code appear here.</p>
        </div>
      )}

      {/* Always on the page, so screen readers announce each new token (a live region
          that appears together with its text is not announced). */}
      <p role="status" className="sr-only">
        {state.issued ? `Token ${state.issued.token} issued for ${state.issued.patientName}.` : ""}
      </p>
    </div>
  );
}
