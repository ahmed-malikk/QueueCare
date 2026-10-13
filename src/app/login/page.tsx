import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { checkAccess } from "@/lib/access";
import { DemoAccounts, SignInForm } from "./SignInForm";

export const metadata: Metadata = { title: "Staff sign in · QueueCare" };

export default async function LoginPage() {
  // Staff who are already signed in go straight to their screen.
  const user = await getCurrentUser();
  const access = checkAccess("/login", user?.role ?? null);
  if (!access.allow) redirect(access.redirectTo);

  return (
    <section className="grid gap-3.5 py-8 sm:py-12 md:grid-cols-2">
      <div className="flex flex-col rounded-[1.25rem] bg-sage p-7 sm:p-10">
        <h1 className="text-4xl leading-tight text-primary sm:text-5xl">Staff sign in</h1>
        <p className="mt-4 max-w-[40ch] text-[#26392e]">
          For reception and the doctor. Patients never need an account: they follow the queue from the code on their
          token.
        </p>
        <div className="mt-8 md:mt-auto md:pt-10">
          <DemoAccounts />
        </div>
      </div>

      <div className="rounded-[1.25rem] border bg-card p-7 sm:p-10">
        <h2 className="text-2xl text-primary">Clinic account</h2>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">Use the email and password your clinic gave you.</p>
        <SignInForm />
      </div>
    </section>
  );
}
