import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CLINIC_TIME_ZONE } from "@/lib/clinicTime";
import type { StaffVisit } from "@/lib/queueData";
import type { QueueRow } from "@/lib/queueView";
import { formatToken } from "@/lib/registration";
import { UrgencyControl } from "./UrgencyControl";

const BADGE = ["normal", "urgent", "emergency"] as const;

const clockTime = new Intl.DateTimeFormat("en-GB", { timeZone: CLINIC_TIME_ZONE, hour: "2-digit", minute: "2-digit" });

/** Today's waiting patients in the order the doctor will see them. */
export function QueueList({ rows }: { rows: QueueRow<StaffVisit>[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="text-lg font-semibold">Today&apos;s queue</h2>
        </CardTitle>
        <CardDescription>
          {rows.length === 0
            ? "Nobody is waiting."
            : `${rows.length} waiting, in the order the doctor will see them.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
            <Users className="size-8" aria-hidden="true" />
            <p className="text-sm">Registered patients will appear here.</p>
          </div>
        ) : (
          <ol aria-label="Waiting patients" className="divide-y">
            {rows.map((row) => {
              const token = formatToken(row.visit.tokenNumber);
              return (
                <li
                  key={row.visit.id}
                  data-testid={`queue-row-${token}`}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3"
                >
                  <span className="w-6 text-sm text-muted-foreground tabular-nums" aria-label={`Position ${row.position}`}>
                    {row.position}
                  </span>
                  <span className="w-16 font-mono text-lg font-semibold tabular-nums">{token}</span>
                  <div className="min-w-0 flex-1 basis-40">
                    <p className="truncate font-medium">{row.visit.patientName}</p>
                    <p className="text-sm text-muted-foreground">
                      Waiting {row.waitedMinutes} min
                      {row.visit.bookedAt && ` · booked ${clockTime.format(row.visit.bookedAt)}`}
                    </p>
                  </div>
                  <Badge variant={BADGE[row.level]}>{row.label}</Badge>
                  <UrgencyControl visitId={row.visit.id} token={token} urgency={row.visit.urgency} />
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
