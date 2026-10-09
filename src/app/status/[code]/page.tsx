import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LiveRefresh } from "@/components/LiveRefresh";
import { TokenSlip } from "@/components/TokenSlip";
import { describeStatus, type PatientStatus, type StatusResponse } from "@/lib/patientStatus";
import { createClient } from "@/lib/supabase/server";
import { formatEstimate } from "@/lib/waitText";

// A private link: keep it out of search engines.
export const metadata: Metadata = { title: "Your token · QueueCare", robots: { index: false, follow: false } };

const longDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" });

function Message({ text }: { text: string }) {
  return <p className="text-xl font-bold text-foreground">{text}</p>;
}

function SlipDetails({ status }: { status: PatientStatus }) {
  switch (status.state) {
    case "waiting": {
      const ahead = status.estimate.patientsAhead;
      return (
        <>
          {ahead === 0 ? (
            <Message text="You are next" />
          ) : (
            <Message text={`${ahead} ${ahead === 1 ? "patient" : "patients"} ahead of you`} />
          )}
          {ahead > 0 && <p className="mt-3 text-base font-semibold text-foreground">{formatEstimate(status.estimate)}</p>}
        </>
      );
    }
    case "called":
      return <Message text="Please go in now" />;
    case "done":
      return <Message text="Your visit is finished" />;
    case "missed":
      return <Message text="You were marked as missed. Please speak to reception." />;
    case "another-day":
      return (
        <Message text={`This token was for ${longDate.format(new Date(status.visitDate))}. Ask reception for today's token.`} />
      );
  }
}

export default async function StatusPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^[0-9a-f]{32}$/.test(code)) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("visit_status", { p_code: code });
  if (error) throw error;
  if (!data) notFound();

  const status = describeStatus(data as StatusResponse, new Date());
  const waiting = status.state === "waiting";

  return (
    <section className="mx-auto max-w-sm py-8 sm:py-12">
      <TokenSlip caption="Your token" token={status.token} tokenTestId="status-token">
        <div data-testid="status-message">
          <SlipDetails status={status} />
        </div>
      </TokenSlip>

      {waiting && (
        <div className="mt-6 space-y-2 text-center text-muted-foreground">
          {status.withDoctor && (
            <p>
              Now with the doctor: <span className="token-type text-2xl text-foreground">{status.withDoctor}</span>
            </p>
          )}
          <p>This page updates by itself, so you can step out and check again.</p>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <LiveRefresh />
      </div>
    </section>
  );
}
