import type { Metadata } from "next";
import { Stethoscope } from "lucide-react";
import { LiveRefresh } from "@/components/LiveRefresh";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card className="border-primary/30 shadow-sm">
          <CardHeader>
            <CardTitle>
              <h2 className="text-lg font-semibold">With you now</h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5">
            {withDoctor ? (
              <div className="text-center">
                <p data-testid="with-doctor-token" className="font-mono text-6xl font-bold text-primary tabular-nums">
                  {formatToken(withDoctor.tokenNumber)}
                </p>
                <p className="mt-1 text-lg font-medium">{withDoctor.patientName}</p>
                <Badge variant={BADGE[withDoctor.urgency]} className="mt-2">
                  {URGENCY_NAMES[withDoctor.urgency]}
                </Badge>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
                <Stethoscope className="size-8" aria-hidden="true" />
                <p className="text-sm">Nobody yet. Press Call next to bring in the first patient.</p>
              </div>
            )}
            <CallNextButton hasWaiting={rows.length > 0} hasCurrent={withDoctor !== null} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="text-lg font-semibold">Next up</h2>
            </CardTitle>
            <CardDescription data-testid="waiting-count">
              {rows.length === 0 ? "Nobody is waiting." : `${rows.length} waiting`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol aria-label="Next patients" className="divide-y">
              {rows.slice(0, NEXT_UP).map((row) => (
                <li key={row.visit.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                  <span className="w-6 text-sm text-muted-foreground tabular-nums">{row.position}</span>
                  <span className="w-16 font-mono text-lg font-semibold tabular-nums">
                    {formatToken(row.visit.tokenNumber)}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{row.visit.patientName}</span>
                  <Badge variant={BADGE[row.level]}>{row.label}</Badge>
                  <span className="w-24 text-right text-sm text-muted-foreground">{row.waitedMinutes} min</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
