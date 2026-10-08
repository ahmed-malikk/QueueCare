import type { Metadata } from "next";
import { requireAccess } from "@/lib/dal";
import { StaffBar } from "../StaffBar";

export const metadata: Metadata = { title: "Reception · QueueCare" };

export default async function ReceptionPage() {
  const user = await requireAccess("/reception");

  return (
    <section className="pb-12">
      <StaffBar user={user} />
      <div className="py-8">
        <h1 className="text-3xl font-semibold tracking-tight">Reception desk</h1>
        <p className="mt-1 text-muted-foreground">Register patients, set urgency and see today&apos;s queue.</p>
      </div>
    </section>
  );
}
