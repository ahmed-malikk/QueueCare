import { Clock, HeartPulse, QrCode, Scale, Smartphone, Stethoscope, UserRoundPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FEATURES = [
  {
    icon: HeartPulse,
    title: "Urgent patients first",
    text: "Reception marks a patient Urgent or Emergency, and the queue reorders itself straight away.",
  },
  {
    icon: Scale,
    title: "Fair for everyone else",
    text: "Every 30 minutes of waiting moves a patient up a level, so nobody is left behind by a busy evening.",
  },
  {
    icon: Smartphone,
    title: "Your wait on your phone",
    text: "Patients scan a QR code to see their place and estimated wait. No app, no sign-up.",
  },
];

const STEPS = [
  { icon: UserRoundPlus, title: "Reception registers", text: "Name, walk-in or booked, and urgency. A token is issued." },
  { icon: QrCode, title: "Patient scans", text: "The token's QR code opens a live status page on their phone." },
  { icon: Stethoscope, title: "Doctor calls next", text: "One tap calls the right patient; every screen updates." },
];

/**
 * An illustration of the queue rules, not live data. A-03 has waited 30+ minutes, so it counts
 * as Urgent and goes before A-07 (same level, arrived earlier).
 */
const EXAMPLE_QUEUE = [
  { token: "A-12", level: "emergency", label: "Emergency", note: "Seen first" },
  { token: "A-03", level: "urgent", label: "Normal → Urgent", note: "Waited 34 min" },
  { token: "A-07", level: "urgent", label: "Urgent", note: "Waiting 5 min" },
  { token: "A-09", level: "normal", label: "Normal", note: "Waiting 12 min" },
] as const;

export default function HomePage() {
  return (
    <>
      <section className="grid items-center gap-10 py-12 md:grid-cols-[1.1fr_0.9fr] md:py-20">
        <div className="space-y-5">
          <Badge variant="secondary" className="h-6 px-3">
            <Clock /> Live clinic queue
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Urgent patients first. Fair for everyone else.
          </h1>
          <p className="max-w-[56ch] text-lg text-muted-foreground text-pretty">
            QueueCare replaces the paper token list at the reception desk. Urgent patients are seen first,
            everyone else is served fairly in order, and every patient can see their place and estimated
            wait on their own phone.
          </p>
        </div>

        <Card aria-label="Example queue" className="shadow-sm">
          <CardHeader>
            <CardTitle>Example queue</CardTitle>
            <CardDescription>How QueueCare orders patients</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="divide-y">
              {EXAMPLE_QUEUE.map((patient, index) => (
                <li key={patient.token} className="flex items-center gap-3 py-3">
                  <span className="w-5 text-sm text-muted-foreground tabular-nums">{index + 1}</span>
                  <span className="font-mono text-lg font-semibold tabular-nums">{patient.token}</span>
                  <Badge variant={patient.level}>{patient.label}</Badge>
                  <span className="ml-auto text-sm text-muted-foreground">{patient.note}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="features" className="pb-12">
        <h2 id="features" className="sr-only">
          Features
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <Card key={title}>
              <CardHeader>
                <span className="mb-2 inline-flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <CardTitle>{title}</CardTitle>
                <CardDescription className="text-pretty">{text}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="how-it-works" className="pb-16">
        <h2 id="how-it-works" className="mb-6 text-2xl font-semibold tracking-tight">
          How it works
        </h2>
        <ol className="grid gap-6 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, index) => (
            <li key={title} className="flex gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-medium">
                  {index + 1}. {title}
                </p>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
