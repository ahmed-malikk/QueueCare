import { QrCode } from "lucide-react";
import { AnimatedItem, AnimatedList } from "@/components/AnimatedList";
import { CLINIC_TIME_ZONE } from "@/lib/clinicTime";
import type { StaffVisit } from "@/lib/queueData";
import type { QueueRow } from "@/lib/queueView";
import { formatToken } from "@/lib/registration";
import { QrDialog } from "./QrDialog";
import { UrgencyControl } from "./UrgencyControl";

const clockTime = new Intl.DateTimeFormat("en-GB", { timeZone: CLINIC_TIME_ZONE, hour: "2-digit", minute: "2-digit" });

/** "Walk-in, waiting 12 min" or "Booked for 19:35, waiting 22 min". */
function visitLine(row: QueueRow<StaffVisit>) {
  const booked = row.visit.bookedAt ? `Booked for ${clockTime.format(row.visit.bookedAt)}` : "Walk-in";
  return `${booked}, waiting ${row.waitedMinutes} min`;
}

/** Today's waiting patients in the order the doctor will see them. */
export function QueueList({ rows }: { rows: QueueRow<StaffVisit>[] }) {
  return (
    <section aria-labelledby="queue-heading" className="rounded-[20px] border bg-card p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="queue-heading" className="text-[26px] leading-tight text-primary">
          Today&apos;s queue
        </h2>
        <p className="text-sm text-muted-foreground">{rows.length > 0 && `${rows.length} waiting`}</p>
      </div>
      <p className="mt-0.5 mb-2 text-sm text-muted-foreground">
        In the order the doctor will see them. Tap a patient&apos;s urgency to change it.
      </p>

      {rows.length === 0 ? (
        <p className="px-2.5 py-9 text-center text-muted-foreground">
          Nobody is waiting. Registered patients appear here.
        </p>
      ) : (
        <AnimatedList aria-label="Waiting patients">
          {rows.map((row) => {
            const token = formatToken(row.visit.tokenNumber);
            return (
              <AnimatedItem
                key={row.visit.id}
                data-testid={`queue-row-${token}`}
                className="grid grid-cols-[20px_auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 border-t border-[#e7ede9] bg-card px-1.5 py-3 transition-colors first:border-t-0 hover:bg-[#f6faf6] sm:grid-cols-[28px_78px_minmax(0,1fr)_auto]"
              >
                <span className="text-[13px] text-muted-foreground tabular-nums" aria-label={`Position ${row.position}`}>
                  {row.position}
                </span>
                <span className="token-type text-[26px] text-primary sm:text-[30px]">{token}</span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{row.visit.patientName}</span>
                  <span className="block text-[13px] text-muted-foreground">{visitLine(row)}</span>
                </span>
                <div className="col-span-3 col-start-1 flex items-center justify-end gap-2 sm:col-span-1 sm:col-start-auto">
                  <UrgencyControl
                    visitId={row.visit.id}
                    token={token}
                    urgency={row.visit.urgency}
                    level={row.level}
                    label={row.label}
                  />
                  {row.visit.statusPath && (
                    <QrDialog token={token} statusPath={row.visit.statusPath}>
                      <button
                        type="button"
                        aria-label={`Show QR code for ${token}`}
                        title="Show QR code"
                        className="grid size-10 place-items-center rounded-[10px] border-[1.5px] bg-card text-primary transition-[translate,box-shadow,background-color] duration-200 ease-(--ease-out-soft) outline-none hover:-translate-y-0.5 hover:bg-secondary hover:shadow-[0_8px_18px_-10px_rgb(30_59_44/0.55)] focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-0 active:scale-95 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                      >
                        <QrCode className="size-[18px]" aria-hidden="true" />
                      </button>
                    </QrDialog>
                  )}
                </div>
              </AnimatedItem>
            );
          })}
        </AnimatedList>
      )}
    </section>
  );
}
