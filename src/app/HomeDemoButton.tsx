"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { signInAsDemo, type SignInState } from "./login/actions";

const initialState: SignInState = { error: null };

/** The home page's big "Try the live demo" tile: one click signs in as the demo receptionist. */
export function HomeDemoButton() {
  const [state, action, pending] = useActionState(signInAsDemo.bind(null, "receptionist"), initialState);
  return (
    <form action={action} className="lg:col-start-1">
      <button
        type="submit"
        disabled={pending}
        className="group flex w-full items-center justify-between rounded-[22px] bg-primary px-[34px] py-[30px] text-left text-lg font-medium text-primary-foreground transition-[translate,scale,box-shadow,background-color] duration-200 ease-(--ease-out-soft) outline-none hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_18px_30px_-16px_rgb(30_59_44/0.7)] focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.99] disabled:cursor-wait motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <span>
          Try the live demo
          <small className="mt-1 block text-[13px] font-normal opacity-75">
            {pending ? "Signing you in…" : "One click signs you in as the receptionist"}
          </small>
        </span>
        {pending ? (
          <Loader2 className="size-[30px] animate-spin" aria-hidden="true" />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="size-[30px] transition-transform duration-200 group-hover:translate-x-1.5 motion-reduce:transition-none">
            <path d="M4 12h15M13 6l6 6-6 6" />
          </svg>
        )}
      </button>
      {state.error && <p role="alert" className="mt-2 text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
