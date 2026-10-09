import type { Metadata } from "next";
import { LiveRefresh } from "@/components/LiveRefresh";
import { Badge } from "@/components/ui/badge";
import { TokenSlip } from "@/components/TokenSlip";
import { requireAccess } from "@/lib/dal";
import { getWaitingToday, getWithDoctorToday } from "@/lib/queueData";
import { buildQueueView, URGENCY_NAMES } from "@/lib/queueView";
import { formatToken } from "@/lib/registration";
import { createClient } from "@/lib/supabase/server";
import { StaffBar } from "../StaffBar";
import { CallNextButton } from "./CallNextButton";

export const metadata: Metadata = { title: "Doctor · QueueCare" };

const BADGE = ["normal", "urgent", "emergency"] as const;
const NEXT_UP = 5;

export default async function DoctorPage() {
  const user = await requireAccess("/doctor");
  const now = new Date();
  const supabase = await createClient();
  const [waiting, withDoctor] = await Promise.all([getWaitingToday(supabase, now), getWithDoctorToday(supabase, now)]);
  const rows = buildQueueView(waiting, now);

  return (
    <section className="pb-12">
      <StaffBar user={user} />
      <div className="flex flex-wrap items-end justify-between gap-3 py-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Doctor&apos;s screen</h1>
          <p className="mt-1 text-muted-foreground">See who is next and call them in.</p>
        </div>
        <LiveRefresh />
      </div>

      <div className="grid items-start gap-10 lg:grid-cols-[22rem_1fr]">
        <section aria-labelledby="current-heading">
          <h2 id="current-heading" className="text-xl font-bold tracking-tight">
            With you now
          </h2>
          <div className="mt-4">
            {withDoctor ? (
              <TokenSlip
                key={withDoctor.id}
                print
                caption={withDoctor.patientName}
                token={formatToken(withDoctor.tokenNumber)}
                tokenTestId="with-doctor-token"
              >
                <Badge variant={BADGE[withDoctor.urgency]}>{URGENCY_NAMES[withDoctor.urgency]}</Badge>
              </TokenSlip>
            ) : (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-sm border-2 border-dashed border-slip-edge px-6 text-center">
                <p className="text-muted-foreground">Nobody yet. Call the first patient when you are ready.</p>
              </div>
            )}
          </div>
          <div className="mt-5">
            <CallNextButton hasWaiting={rows.length > 0} hasCurrent={withDoctor !== null} />
          </div>
        </section>

        <section aria-labelledby="next-heading">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="next-heading" className="text-xl font-bold tracking-tight">
              Next up
            </h2>
            <p data-testid="waiting-count" className="text-sm text-muted-foreground">
              {rows.length === 0 ? "Nobody is waiting." : `${rows.length} waiting`}
            </p>
          </div>
          {rows.length > 0 && (
            <ol aria-label="Next patients" className="mt-4 divide-y border-y">
              {rows.slice(0, NEXT_UP).map((row) => (
                <li key={row.visit.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                  <span className="w-4 text-sm text-muted-foreground tabular-nums">{row.position}</span>
                  <span className="token-type w-16 text-3xl">{formatToken(row.visit.tokenNumber)}</span>
                  <span className="min-w-0 flex-1 truncate font-medium">{row.visit.patientName}</span>
                  <Badge variant={BADGE[row.level]}>{row.label}</Badge>
                  <span className="w-20 text-right text-sm text-muted-foreground tabular-nums">
                    {row.waitedMinutes} min
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </section>
  );
}
