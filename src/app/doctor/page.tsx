import type { Metadata } from "next";
import { requireAccess } from "@/lib/dal";
import { StaffBar } from "../StaffBar";

export const metadata: Metadata = { title: "Doctor · QueueCare" };

export default async function DoctorPage() {
  const user = await requireAccess("/doctor");

  return (
    <section className="pb-12">
      <StaffBar user={user} />
      <div className="py-8">
        <h1 className="text-3xl font-semibold tracking-tight">Doctor&apos;s screen</h1>
        <p className="mt-1 text-muted-foreground">See who is next and call them in.</p>
      </div>
    </section>
  );
}
