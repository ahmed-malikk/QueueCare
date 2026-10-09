import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { checkAccess } from "@/lib/access";
import { SignInForm } from "./SignInForm";

export const metadata: Metadata = { title: "Staff sign-in · QueueCare" };

export default async function LoginPage() {
  // Staff who are already signed in go straight to their screen.
  const user = await getCurrentUser();
  const access = checkAccess("/login", user?.role ?? null);
  if (!access.allow) redirect(access.redirectTo);

  return (
    <section className="grid gap-10 py-12 sm:py-20 md:grid-cols-[24rem_1fr]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff sign-in</h1>
        <p className="mt-2 text-muted-foreground">For reception and the doctor. Patients don&apos;t need an account.</p>
        <div className="mt-8 rounded-lg border bg-card p-5 sm:p-6">
          <SignInForm />
        </div>
      </div>
      <aside className="hidden self-center border-l-2 border-foreground pl-8 text-muted-foreground md:block">
        <p className="max-w-[40ch] text-lg leading-relaxed">
          Reception registers patients and sets urgency. The doctor sees who is next and calls them in. Each of them
          sees only their own screen.
        </p>
      </aside>
    </section>
  );
}
