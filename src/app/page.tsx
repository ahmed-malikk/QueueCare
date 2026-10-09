import Link from "next/link";
import { TokenSlip } from "@/components/TokenSlip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/** An illustration of the queue rules, not live data. */
const EXAMPLE_QUEUE = [
  { token: "A-12", level: "emergency", label: "Emergency", note: "arrived 2 min ago" },
  { token: "A-03", level: "urgent", label: "Raised to Urgent", note: "waited 34 min" },
  { token: "A-07", level: "urgent", label: "Urgent", note: "waited 5 min" },
  { token: "A-09", level: "normal", label: "Normal", note: "waited 12 min" },
] as const;

const RULES = [
  ["Emergencies go first.", "Reception marks them, and the queue reorders straight away."],
  ["Urgent patients come next.", "The doctor decides who is urgent; reception changes it with one tap."],
  ["Waiting moves you up.", "After 30 minutes, a Normal patient counts as Urgent, so nobody is left behind."],
  ["Bookings are kept.", "A booked patient counts as arriving 10 minutes before their time."],
  ["Otherwise, first come, first served.", "Ties go to whoever arrived earlier."],
] as const;

const SCREENS = [
  ["Reception desk", "Register a patient in a few taps. The token and its QR code appear on screen for the patient to scan."],
  ["Doctor", "See who is with you and who is next. One button calls the next patient."],
  ["Patient's phone", "Scan the token's QR code to see your place and wait. No app and no sign-up."],
] as const;

export default function HomePage() {
  return (
    <>
      <section className="grid items-center gap-12 py-12 md:grid-cols-[1.15fr_0.85fr] md:py-20">
        <div>
          <h1 className="max-w-[16ch] text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl">
            The paper token, now with a wait time.
          </h1>
          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted-foreground text-pretty">
            QueueCare replaces the token list at a small clinic&apos;s reception desk. Urgent patients are seen first,
            everyone else keeps their place, and every patient can follow the queue on their own phone instead of
            asking how much longer.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Button asChild size="lg">
              <Link href="/login">Try the reception desk</Link>
            </Button>
            <a href="#order" className="font-medium text-foreground underline decoration-slip-edge decoration-2 underline-offset-4 hover:decoration-primary">
              How the order is decided
            </a>
          </div>
        </div>

        <figure className="mx-auto w-full max-w-72">
          <TokenSlip caption="Your token" token="A-14">
            <p className="text-base font-semibold text-foreground">3 patients ahead of you</p>
            <p>About 15–25 minutes</p>
          </TokenSlip>
          <figcaption className="mt-3 text-center text-sm text-muted-foreground">
            What the patient sees after scanning the token.
          </figcaption>
        </figure>
      </section>

      <section id="order" aria-labelledby="order-heading" className="scroll-mt-20 border-t py-14">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <h2 id="order-heading" className="text-2xl font-bold tracking-tight">
              How the order is decided
            </h2>
            <dl className="mt-6 space-y-4">
              {RULES.map(([rule, detail]) => (
                <div key={rule}>
                  <dt className="font-semibold">{rule}</dt>
                  <dd className="text-muted-foreground">{detail}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">For example, at 7 pm the doctor sees, in this order:</p>
            <ol aria-label="Example queue" className="mt-4 divide-y border-y">
              {EXAMPLE_QUEUE.map((patient, index) => (
                <li key={patient.token} className="flex items-center gap-4 py-3">
                  <span className="w-4 text-sm text-muted-foreground tabular-nums">{index + 1}</span>
                  <span className="token-type w-16 text-3xl">{patient.token}</span>
                  <Badge variant={patient.level}>{patient.label}</Badge>
                  <span className="ml-auto text-sm text-muted-foreground">{patient.note}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-sm text-muted-foreground">
              A-03 has waited over 30 minutes, so it goes before A-07, who is urgent but arrived later.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="screens-heading" className="border-t py-14">
        <h2 id="screens-heading" className="text-2xl font-bold tracking-tight">
          One queue, three screens
        </h2>
        <div className="mt-6 grid gap-8 md:grid-cols-3">
          {SCREENS.map(([name, text]) => (
            <div key={name} className="border-t-2 border-foreground pt-4">
              <h3 className="font-semibold">{name}</h3>
              <p className="mt-1 text-muted-foreground text-pretty">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
