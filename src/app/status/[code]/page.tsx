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

/** One message in English with a short Roman Urdu line under it (most patients asked for Urdu). */
function Message({ english, urdu }: { english: string; urdu: string }) {
  return (
    <>
      <p className="text-xl font-bold text-foreground">{english}</p>
      <p lang="ur-Latn" className="mt-0.5">
        {urdu}
      </p>
    </>
  );
}

function SlipDetails({ status }: { status: PatientStatus }) {
  switch (status.state) {
    case "waiting": {
      const ahead = status.estimate.patientsAhead;
      return (
        <>
          {ahead === 0 ? (
            <Message english="You are next" urdu="Aap agle hain" />
          ) : (
            <Message
              english={`${ahead} ${ahead === 1 ? "patient" : "patients"} ahead of you`}
              urdu={`Aap se pehle ${ahead} mareez hain`}
            />
          )}
          {ahead > 0 && <p className="mt-3 text-base font-semibold text-foreground">{formatEstimate(status.estimate)}</p>}
        </>
      );
    }
    case "called":
      return <Message english="Please go in now" urdu="Ab andar tashreef le jayein" />;
    case "done":
      return <Message english="Your visit is finished" urdu="Aap ka muaina ho gaya hai" />;
    case "missed":
      return <Message english="You were marked as missed. Please speak to reception." urdu="Meharbani kar ke reception se baat karein" />;
    case "another-day":
      return (
        <Message
          english={`This token was for ${longDate.format(new Date(status.visitDate))}`}
          urdu="Aaj ke liye reception se naya token lein"
        />
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
