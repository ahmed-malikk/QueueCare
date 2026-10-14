import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import { homeFor } from "@/lib/access";
import { HomeDemoButton } from "./HomeDemoButton";
import { HomeJourney } from "./HomeJourney";
import waitingRoom from "../../public/images/waiting-room.jpg";

/** Rules as published in the PRD. The example queue below is an illustration, not live data. */
const RULES = [
  ["Emergencies go first.", "Reception marks them, and the queue reorders straight away."],
  ["Urgent patients come next.", "The doctor decides who is urgent; reception changes it with one tap."],
  ["Waiting moves you up.", "After 30 minutes, a Normal patient counts as Urgent, so nobody is left behind."],
  ["Bookings are kept.", "A booked patient counts as arriving 10 minutes before their time."],
  ["Otherwise, first come, first served.", "Ties go to whoever arrived earlier."],
] as const;

const EXAMPLE_QUEUE = [
  { token: "A-12", level: 2, label: "Emergency", note: "arrived 2 min ago" },
  { token: "A-03", level: 1, label: "Raised to Urgent", note: "waited 34 min" },
  { token: "A-07", level: 1, label: "Urgent", note: "waited 5 min" },
  { token: "A-09", level: 0, label: "Normal", note: "waited 12 min" },
] as const;

const DESK_PREVIEW = [
  { token: "A-15", arrived: "7:42", level: 2, expected: "Next" },
  { token: "A-09", arrived: "7:01", level: 1, expected: "5–10 min" },
  { token: "A-11", arrived: "7:20", level: 0, expected: "10–15 min" },
  { token: "A-12", arrived: "7:33", level: 0, expected: "15–20 min" },
] as const;

const PILL = ["bg-secondary text-primary", "bg-urgent-soft text-urgent", "bg-emergency-soft text-emergency"];
const SEG_ON = ["bg-primary text-white", "bg-primary text-white", "bg-emergency text-white"];

const FACTS = [
  ["4 of 4", "people interviewed said not knowing the wait was worse than the wait itself."],
  ["0.9 s", "slowest time for a change at reception to reach every screen. The target was 2 s."],
  ["2.3 s", "for the patient page to load fully on slow mobile data. The target was 3 s."],
] as const;

export default async function HomePage() {
  const user = await getCurrentUser();
  const staffRole = user?.role === "receptionist" || user?.role === "doctor" ? user.role : null;

  return (
    <div className="pt-1.5 pb-10">
      {/* Hero: the promise, the live demo, and how it works as an animation */}
      <section id="how" className="grid scroll-mt-24 gap-3.5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex min-h-[360px] flex-col justify-between rounded-[22px] bg-sage px-6 py-8 sm:px-10 sm:py-11">
          <h1 className="text-[clamp(42px,5vw,68px)] leading-[1.02] tracking-[-0.02em] text-primary">
            Keep the paper token. Add the wait time.
          </h1>
          <p className="mt-7 max-w-[40ch] text-[#26392e]">
            QueueCare puts urgent patients first, keeps everyone else in a fair order, and shows every patient how long
            they will wait, on their own phone or the waiting-room TV.
          </p>
        </div>
        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:h-full">
          <HomeJourney />
        </div>
        {staffRole ? (
          <Link
            href={homeFor(staffRole)}
            className="flex items-center justify-between rounded-[22px] bg-primary px-[34px] py-[30px] text-lg font-medium text-primary-foreground transition-[translate,background-color] duration-200 hover:-translate-y-0.5 hover:bg-primary-hover motion-reduce:hover:translate-y-0 lg:col-start-1"
          >
            Open your screen <span aria-hidden="true" className="text-2xl">&rsaquo;</span>
          </Link>
        ) : (
          <HomeDemoButton />
        )}
      </section>

      {/* The finding QueueCare answers, and what was measured, on the waiting-room photo */}
      <section
        id="results"
        aria-labelledby="results-heading"
        className="relative mt-3.5 flex min-h-[620px] scroll-mt-24 flex-col justify-between overflow-hidden rounded-[22px] bg-[#2a2620] px-[22px] pt-16 pb-7 text-white sm:px-12 sm:pt-14 sm:pb-10"
      >
        <Image
          src={waitingRoom}
          alt=""
          fill
          sizes="(max-width: 1280px) 100vw, 1232px"
          placeholder="blur"
          className="object-cover object-[50%_68%]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,rgb(18_38_28/0.78)_0%,rgb(18_38_28/0.45)_38%,rgb(18_38_28/0.88)_62%,rgb(18_38_28/0.95)_100%)] sm:bg-[linear-gradient(90deg,rgb(18_38_28/0.88)_0%,rgb(18_38_28/0.6)_42%,rgb(18_38_28/0.08)_72%),linear-gradient(0deg,rgb(18_38_28/0.95)_0%,rgb(18_38_28/0.75)_26%,rgb(18_38_28/0)_55%)]"
        />
        <div className="relative">
          <h2 id="results-heading" className="sr-only">
            Why QueueCare exists, and what we measured
          </h2>
          <blockquote className="max-w-[17ch] text-[clamp(34px,4.2vw,56px)] leading-[1.06] tracking-[-0.015em]">
            The worst part isn&apos;t the wait. It&apos;s not knowing how long.
          </blockquote>
          <p className="mt-5 max-w-[42ch] text-[15px] text-[#dce8df]">
            What a clinic receptionist and three patients told us in interviews on 7 October 2026. QueueCare was built
            to answer it.
          </p>
        </div>
        <ul className="relative mt-12 grid gap-5 sm:grid-cols-3 sm:gap-8">
          {FACTS.map(([value, text]) => (
            <li key={value} className="border-t border-white/45 pt-4">
              <strong className="block text-[36px] leading-[1.05] font-normal sm:text-[46px]">{value}</strong>
              <span className="mt-1.5 block max-w-[32ch] text-[15px] text-[#e4eee7]">{text}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* The published queue rules, with a worked example */}
      <section
        id="order"
        aria-labelledby="order-heading"
        className="mt-3.5 grid scroll-mt-24 gap-10 rounded-[22px] border bg-card p-6 sm:p-10 lg:grid-cols-2"
      >
        <div>
          <h2 id="order-heading" className="text-[30px] leading-tight text-primary">
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
          <ol aria-label="Example queue" className="mt-3">
            {EXAMPLE_QUEUE.map((patient, index) => (
              <li key={patient.token} className="flex items-center gap-4 border-t border-[#e7ede9] py-3 first:border-t-0">
                <span className="w-4 text-sm text-muted-foreground">{index + 1}</span>
                <span className="token-type w-16 text-3xl text-primary">{patient.token}</span>
                <span className={`rounded-full px-3 py-1.5 text-[13px] font-semibold ${PILL[patient.level]}`}>{patient.label}</span>
                <span className="ml-auto text-sm text-muted-foreground">{patient.note}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm text-muted-foreground">
            A-03 has waited over 30 minutes, so it goes before A-07, who is urgent but arrived later.
          </p>
        </div>
      </section>

      {/* A preview of the front desk and the patient's phone (illustrations, not live data) */}
      <section
        aria-labelledby="desk-heading"
        className="mt-3.5 grid items-start gap-10 rounded-[22px] bg-primary p-6 text-[#e9f1eb] sm:p-10 lg:grid-cols-[minmax(0,1fr)_300px]"
      >
        <div>
          <h2 id="desk-heading" className="mb-1.5 text-[34px] text-white">
            The front desk, in one screen
          </h2>
          <p className="mb-6 max-w-[52ch] text-[#b9cfc0]">
            Register a patient in under 30 seconds, change urgency with one tap, and watch the order explain itself.
          </p>
          <div className="overflow-hidden rounded-[14px] bg-background text-foreground" aria-hidden="true">
            <div className="flex items-center justify-between border-b px-[18px] py-3.5 text-[13px]">
              <b className="text-xl font-normal">Today&apos;s queue</b>
              <span>4 waiting</span>
            </div>
            <table className="w-full border-collapse text-[13.5px]">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="border-b border-[#e7ede9] px-[18px] py-2.5 font-semibold">Token</th>
                  <th className="hidden border-b border-[#e7ede9] px-[18px] py-2.5 font-semibold sm:table-cell">Arrived</th>
                  <th className="border-b border-[#e7ede9] px-[18px] py-2.5 font-semibold">Urgency</th>
                  <th className="hidden border-b border-[#e7ede9] px-[18px] py-2.5 font-semibold sm:table-cell">Expected</th>
                </tr>
              </thead>
              <tbody>
                {DESK_PREVIEW.map((row) => (
                  <tr key={row.token}>
                    <td className="token-type border-b border-[#e7ede9] px-[18px] py-2.5 text-xl text-primary">{row.token}</td>
                    <td className="hidden border-b border-[#e7ede9] px-[18px] py-2.5 sm:table-cell">{row.arrived}</td>
                    <td className="border-b border-[#e7ede9] px-[18px] py-2.5">
                      <span className="inline-flex overflow-hidden rounded-lg border">
                        {["Normal", "Urgent", "Emergency"].map((name, level) => (
                          <span
                            key={name}
                            className={`border-l px-2 py-1 text-xs first:border-l-0 ${level === row.level ? SEG_ON[level] : ""}`}
                          >
                            {name}
                          </span>
                        ))}
                      </span>
                    </td>
                    <td className="hidden border-b border-[#e7ede9] px-[18px] py-2.5 sm:table-cell">{row.expected}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[320px] rounded-[34px] bg-[#0f1f17] p-3 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)]" aria-hidden="true">
          <div className="min-h-[520px] rounded-3xl bg-background px-5 py-6 text-foreground">
            <div className="text-[13px] text-muted-foreground">Your token</div>
            <div className="token-type mt-2 mb-0.5 text-[72px] text-primary">A-14</div>
            <div className="flex gap-1.5 pt-5 pb-2">
              {[0, 1, 2, 3].map((i) => (
                <i key={i} className="h-2.5 flex-1 rounded bg-sage" />
              ))}
              <i className="h-2.5 flex-1 rounded bg-primary" />
            </div>
            <div className="text-[13px] text-muted-foreground">4 patients ahead of you</div>
            <div className="mt-[18px] rounded-[14px] bg-secondary p-4">
              <strong className="block text-[34px] leading-[1.1] font-normal text-primary">20–30 min</strong>
              <span className="text-[13px] text-[#3e5348]">Expected wait. Updates by itself.</span>
            </div>
            <p className="mt-[18px] text-[13px] text-muted-foreground">
              You can step out. Come back when 2 patients are ahead.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
