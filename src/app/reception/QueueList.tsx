import { Badge } from "@/components/ui/badge";
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
    <section aria-labelledby="queue-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="queue-heading" className="text-xl font-bold tracking-tight">
          Today&apos;s queue
        </h2>
        <p className="text-sm text-muted-foreground">
          {rows.length === 0 ? "Nobody is waiting." : `${rows.length} waiting, in the order the doctor will see them`}
        </p>
      </div>
      {rows.length === 0 ? (
        <p className="mt-4 border-y py-8 text-center text-muted-foreground">Registered patients appear here.</p>
      ) : (
        <ol aria-label="Waiting patients" className="mt-4 divide-y border-y">
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
                <span className="token-type w-16 text-3xl">{token}</span>
                <div className="min-w-0 flex-1 basis-40">
                  <p className="truncate font-medium">{row.visit.patientName}</p>
                  <p className="text-sm text-muted-foreground">
                    Waiting {row.waitedMinutes} min
                    {row.visit.bookedAt && `, booked for ${clockTime.format(row.visit.bookedAt)}`}
                  </p>
                </div>
                <Badge variant={BADGE[row.level]}>{row.label}</Badge>
                <UrgencyControl visitId={row.visit.id} token={token} urgency={row.visit.urgency} />
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
