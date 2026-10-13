import type { Metadata } from "next";
import { AnimatedItem, AnimatedList } from "@/components/AnimatedList";
import { requireAccess } from "@/lib/dal";
import { getWaitingToday, getWithDoctorToday } from "@/lib/queueData";
import { buildQueueView, URGENCY_NAMES } from "@/lib/queueView";
import { formatToken } from "@/lib/registration";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { CallNextButton } from "./CallNextButton";

export const metadata: Metadata = { title: "Doctor · QueueCare" };

const NEXT_UP = 5;

/** Urgency pill colours by level (0 Normal, 1 Urgent, 2 Emergency). */
const PILL = ["bg-secondary text-primary", "bg-urgent-soft text-urgent", "bg-emergency-soft text-emergency"];

function UrgencyPill({ level, label }: { level: number; label: string }) {
  return (
    <span className={cn("inline-flex h-9 items-center self-start rounded-full px-3 text-[13px] font-semibold whitespace-nowrap", PILL[level])}>
      {label}
    </span>
  );
}

/**
 * The doctor's screen: who is with you now, one big button that says exactly what it will do,
 * and the next five patients in the order they will be called.
 */
export default async function DoctorPage() {
  await requireAccess("/doctor");
  const now = new Date();
  const supabase = await createClient();
  const [waiting, withDoctor] = await Promise.all([getWaitingToday(supabase, now), getWithDoctorToday(supabase, now)]);
  const rows = buildQueueView(waiting, now);
  const current = withDoctor ? formatToken(withDoctor.tokenNumber) : null;
  const next = rows[0] ? formatToken(rows[0].visit.tokenNumber) : null;

  return (
    <section className="pt-5 pb-12">
      <h1 className="sr-only">Doctor&apos;s screen</h1>

      <div className="grid items-start gap-5 lg:grid-cols-[420px_minmax(0,1fr)]">
        <div>
          <section
            aria-labelledby="current-heading"
            className="flex min-h-[300px] flex-col rounded-[20px] bg-sage p-7"
          >
            <h2 id="current-heading" className="font-sans text-sm font-semibold tracking-normal text-[#2f4a3a]">
              With you now
            </h2>
            {withDoctor ? (
              <div key={withDoctor.id} className="flex flex-col animate-in fade-in-0 slide-in-from-left-6 duration-500 motion-reduce:animate-none">
                <p data-testid="with-doctor-token" className="token-type mt-3.5 mb-1.5 text-[96px] text-primary sm:text-[120px]">
                  {current}
                </p>
                <p className="mb-2.5 text-xl font-semibold">{withDoctor.patientName}</p>
                <UrgencyPill level={withDoctor.urgency} label={URGENCY_NAMES[withDoctor.urgency]} />
              </div>
            ) : (
              <p className="my-auto text-[17px] text-[#2f4a3a]">Nobody yet. Call the first patient when you&apos;re ready.</p>
            )}
          </section>
          <CallNextButton next={next} current={current} />
        </div>

        <section aria-labelledby="next-heading" className="rounded-[20px] border bg-card p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="next-heading" className="text-[26px] leading-tight text-primary">
              Next up
            </h2>
            <p data-testid="waiting-count" className="text-sm text-muted-foreground">
              {rows.length === 0 ? "Nobody waiting" : `${rows.length} waiting`}
            </p>
          </div>
          {rows.length === 0 ? (
            <p className="px-2.5 py-9 text-center text-muted-foreground">Nobody is waiting.</p>
          ) : (
            <AnimatedList aria-label="Next patients" className="mt-2">
              {rows.slice(0, NEXT_UP).map((row) => (
                <AnimatedItem
                  key={row.visit.id}
                  className="grid grid-cols-[20px_minmax(64px,auto)_minmax(0,1fr)] items-center gap-x-3 gap-y-2 border-t border-[#e7ede9] px-1.5 py-3 first:border-t-0 sm:grid-cols-[28px_minmax(78px,auto)_minmax(0,1fr)_auto]"
                >
                  <span className="text-[13px] text-muted-foreground tabular-nums">{row.position}</span>
                  <span className="token-type text-[26px] text-primary sm:text-[30px]">{formatToken(row.visit.tokenNumber)}</span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{row.visit.patientName}</span>
                    <span className="block text-[13px] text-muted-foreground">Waiting {row.waitedMinutes} min</span>
                  </span>
                  <span className="col-span-3 justify-self-end sm:col-span-1">
                    <UrgencyPill level={row.level} label={row.label} />
                  </span>
                </AnimatedItem>
              ))}
            </AnimatedList>
          )}
        </section>
      </div>
    </section>
  );
}
