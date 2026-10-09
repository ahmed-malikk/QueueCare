import type { Metadata } from "next";
import { LiveRefresh } from "@/components/LiveRefresh";
import { requireAccess } from "@/lib/dal";
import { getWaitingToday } from "@/lib/queueData";
import { buildQueueView } from "@/lib/queueView";
import { createClient } from "@/lib/supabase/server";
import { StaffBar } from "../StaffBar";
import { QueueList } from "./QueueList";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = { title: "Reception · QueueCare" };

export default async function ReceptionPage() {
  const user = await requireAccess("/reception");
  const now = new Date();
  const supabase = await createClient();
  const rows = buildQueueView(await getWaitingToday(supabase, now), now);

  return (
    <section className="pb-12">
      <StaffBar user={user} />
      <div className="flex flex-wrap items-end justify-between gap-3 py-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Reception desk</h1>
          <p className="mt-1 text-muted-foreground">Register patients, set urgency and see today&apos;s queue.</p>
        </div>
        <LiveRefresh />
      </div>
      <div className="grid gap-6">
        <RegisterForm />
        <QueueList rows={rows} />
      </div>
    </section>
  );
}
