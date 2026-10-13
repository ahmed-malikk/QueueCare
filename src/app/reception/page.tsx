import type { Metadata } from "next";
import { requireAccess } from "@/lib/dal";
import { getWaitingToday, getWithDoctorToday } from "@/lib/queueData";
import { buildQueueView } from "@/lib/queueView";
import { formatToken } from "@/lib/registration";
import { createClient } from "@/lib/supabase/server";
import { QueueList } from "./QueueList";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = { title: "Reception · QueueCare" };

/**
 * The reception desk: who is with the doctor along the top, then two columns that are always
 * both in view: register a patient on the left, today's queue on the right.
 */
export default async function ReceptionPage() {
  await requireAccess("/reception");
  const now = new Date();
  const supabase = await createClient();
  const [waiting, withDoctor] = await Promise.all([getWaitingToday(supabase, now), getWithDoctorToday(supabase, now)]);
  const rows = buildQueueView(waiting, now);

  return (
    <section className="pt-5 pb-12">
      <h1 className="sr-only">Reception desk</h1>

      <div className="mb-[18px] flex items-center gap-3.5 rounded-[14px] bg-primary px-5 py-3 text-[#e4eee7]">
        <span>With the doctor</span>
        <span className="token-type text-[28px] text-white">
          {withDoctor ? formatToken(withDoctor.tokenNumber) : "Nobody yet"}
        </span>
        <span className="ml-auto text-[13px] opacity-85">{rows.length ? `${rows.length} waiting` : "Nobody waiting"}</span>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[400px_minmax(0,1fr)]">
        <RegisterForm />
        <QueueList rows={rows} />
      </div>
    </section>
  );
}
