import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { ArrowUpRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { signInAsDemo } from "./login/actions";
import { DemoSignInButton } from "./_home/DemoSignInButton";
import { QueueReport } from "./_home/QueueReport";
import receptionShot from "./_home/screens/reception.png";
import doctorShot from "./_home/screens/doctor.png";
import phoneShot from "../../docs/screenshots/patient-phone.png";
import waitingRoomShot from "../../docs/screenshots/waiting-room.png";

const REPO = "https://github.com/ahmed-malikk/QueueCare";
const REPLAY_ID = "replay-emergency";

const RULES = [
  ["Emergencies go first.", "Reception marks them, and the queue reorders straight away."],
  ["Urgent patients come next.", "The doctor decides who is urgent; reception changes it with one tap."],
  ["Waiting moves you up.", "After 30 minutes, a Normal patient counts as Urgent, so nobody is left behind."],
  ["Bookings are kept.", "A booked patient counts as arriving 10 minutes before their time."],
  ["Otherwise, first come, first served.", "Ties go to whoever arrived earlier."],
] as const;

/** `contain` shows the whole picture (the TV keeps every token); the rest fill their frame from the top. */
const SCREENS: { name: string; text: string; image: StaticImageData; alt: string; className: string; contain?: boolean }[] = [
  {
    name: "Reception desk",
    text: "Register a patient in a few taps. The token and its QR code appear on screen for the patient to scan.",
    image: receptionShot,
    alt: "The reception desk: a registration form, the token just issued with its QR code, and today's queue in priority order",
    className: "md:col-span-2",
  },
  {
    name: "Patient's phone",
    text: "Scan the token's QR code to see your place and wait. No app and no sign-up.",
    image: phoneShot,
    alt: "A patient's status page on a phone: token A-201, 2 patients ahead, about 10 to 15 minutes",
    className: "md:row-span-2 [&>div]:aspect-[4/5] md:[&>div]:aspect-auto",
  },
  {
    name: "Doctor",
    text: "See who is with you and who is next. One button calls the next patient.",
    image: doctorShot,
    alt: "The doctor's screen: the patient now with the doctor, a Call next button and the next patients",
    className: "",
  },
  {
    name: "Waiting-room TV",
    text: "Now serving and the next tokens, large enough to read from across the room.",
    image: waitingRoomShot,
    alt: "The waiting-room display: now serving A-200, Priority patient called, and the next three tokens",
    className: "[&>div]:bg-foreground",
    contain: true,
  },
];

/** Measured on the live site (docs/test-report.md). */
const CHECKS = [
  ["Live update reaches other open screens", "0.8–0.9 s", "2 s or less"],
  ["Patient page on slow mobile data", "Token in 0.5 s, page in 2.3 s", "3 s or less"],
  ["Unit tests of the rules", "77 of 77 pass", "All pass"],
  ["System tests in Edge, Chrome and a 375 px phone", "67 pass, 2 skipped by design", "All pass"],
  ["Security checks, acting as each role", "16 of 16 pass", "All pass"],
] as const;

/** A section heading set like a report heading: a heavy double rule above it. */
function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="border-t-[3px] border-double border-foreground pt-5 text-3xl font-bold tracking-tight text-balance">
      {children}
    </h2>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="grid items-center gap-x-16 gap-y-10 pt-10 pb-16 md:pt-16 lg:grid-cols-[1fr_1.05fr] lg:pt-20 lg:pb-24">
        <div>
          <h1 className="max-w-[14ch] text-[2.75rem] leading-[1.03] font-extrabold tracking-[-0.025em] text-balance sm:text-6xl">
            The paper token, now with a wait time.
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-muted-foreground text-pretty">
            Urgent patients are seen first, everyone else keeps their place, and every patient follows the queue on
            their own phone.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <form action={signInAsDemo.bind(null, "receptionist")}>
              <DemoSignInButton label="Try the reception desk" pendingLabel="Opening the reception desk…" />
            </form>
            <button
              id={REPLAY_ID}
              type="button"
              className="inline-flex min-h-11 items-center gap-2 font-semibold underline decoration-primary decoration-2 underline-offset-[6px] hover:decoration-foreground"
            >
              <Play className="size-4 fill-current" aria-hidden="true" />
              Watch an emergency arrive
            </button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Demo data and a public demo account. No sign-up.</p>
        </div>

        <QueueReport replayButtonId={REPLAY_ID} />
      </section>

      <section id="order" aria-labelledby="order-heading" className="scroll-mt-20 pb-20">
        <div className="grid gap-x-16 gap-y-8 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <SectionHeading id="order-heading">How the order is decided</SectionHeading>
            <p className="mt-4 max-w-[44ch] text-muted-foreground text-pretty">
              Five rules, applied in turn. Every screen uses the same rules, so the receptionist can explain any place
              in the queue in one sentence.
            </p>
          </div>
          <dl className="border-t-[3px] border-double border-foreground lg:mt-0">
            {RULES.map(([rule, detail]) => (
              <div key={rule} className="grid gap-1 border-b py-4 sm:grid-cols-[15rem_1fr] sm:gap-6">
                <dt className="font-semibold">{rule}</dt>
                <dd className="text-muted-foreground">{detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="screens-heading" className="pb-20">
        <SectionHeading id="screens-heading">One queue, four screens</SectionHeading>
        <p className="mt-4 max-w-[60ch] text-muted-foreground text-pretty">
          Every screen updates by itself within a second of a change, without refreshing.
        </p>
        <div className="mt-8 grid gap-x-8 gap-y-10 md:grid-cols-3">
          {SCREENS.map((screen) => (
            <figure key={screen.name} className={cn("flex flex-col", screen.className)}>
              <div className="relative aspect-[16/10] overflow-hidden rounded-lg border bg-muted md:aspect-auto md:min-h-56 md:flex-1">
                <Image
                  src={screen.image}
                  alt={screen.alt}
                  fill
                  sizes="(min-width: 768px) 66vw, 100vw"
                  className={screen.contain ? "object-contain" : "object-cover object-top"}
                />
              </div>
              <figcaption className="mt-3 border-t-2 border-foreground pt-3">
                <span className="block font-semibold">{screen.name}</span>
                <span className="mt-1 block text-muted-foreground text-pretty">{screen.text}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section aria-labelledby="checks-heading" className="pb-24">
        <div className="grid gap-x-16 gap-y-8 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <SectionHeading id="checks-heading">Built and tested like a product</SectionHeading>
            <p className="mt-4 max-w-[44ch] text-muted-foreground text-pretty">
              It started with interviews: a clinic receptionist and three patients in Lahore said the worst part of
              waiting is not knowing how long it will be. The timings and system tests were measured on the live site.
            </p>
            <a
              href={REPO}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex min-h-11 items-center gap-1.5 font-semibold underline decoration-primary decoration-2 underline-offset-[6px] hover:decoration-foreground"
            >
              Read the case study on GitHub <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
            <div className="mt-8 border-t pt-6">
              <p className="font-semibold">Try the other side of the queue</p>
              <p className="mt-1 max-w-[44ch] text-muted-foreground text-pretty">
                Call the next patient as the doctor, with the waiting-room display open in another window.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
                <form action={signInAsDemo.bind(null, "doctor")}>
                  <DemoSignInButton label="Try the doctor's screen" pendingLabel="Opening the doctor's screen…" tone="outline" />
                </form>
                <Link
                  href="/display"
                  className="inline-flex min-h-11 items-center gap-1.5 font-semibold underline decoration-primary decoration-2 underline-offset-[6px] hover:decoration-foreground"
                >
                  Open the waiting-room display <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
          <div>
            <table className="w-full border-collapse text-left tabular-nums">
              <caption className="sr-only">Measured results against their targets</caption>
              <thead>
                <tr className="border-t-[3px] border-b border-double border-b-foreground border-t-foreground text-[0.6875rem] tracking-[0.08em] text-muted-foreground uppercase">
                  <th scope="col" className="py-2.5 pr-4 font-semibold">Check</th>
                  <th scope="col" className="py-2.5 pr-4 font-semibold">Result</th>
                  <th scope="col" className="py-2.5 font-semibold">Target</th>
                </tr>
              </thead>
              <tbody>
                {CHECKS.map(([check, result, target]) => (
                  <tr key={check} className="border-b">
                    <th scope="row" className="py-3 pr-4 font-medium">{check}</th>
                    <td className="py-3 pr-4 font-semibold text-primary">{result}</td>
                    <td className="py-3 text-muted-foreground sm:whitespace-nowrap">{target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </>
  );
}
