import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <section className="flex justify-center py-10 sm:py-16">
      <Card className="w-full max-w-sm shadow-sm">
        <CardHeader className="text-center">
          <LogoMark className="mx-auto mb-2 size-11" />
          <CardTitle>
            <h1 className="text-xl font-semibold">Staff sign-in</h1>
          </CardTitle>
          <CardDescription>For the reception desk and the doctor. Patients don&apos;t need to sign in.</CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm />
        </CardContent>
      </Card>
    </section>
  );
}
