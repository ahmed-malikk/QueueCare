import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { describeStatus, type PatientStatus, type StatusResponse } from "@/lib/patientStatus";
import { COME_BACK_AT, stepOutAdvice } from "@/lib/stepOut";
import { createClient } from "@/lib/supabase/server";
import { formatRange } from "@/lib/waitText";

// A private link: keep it out of search engines.
export const metadata: Metadata = { title: "Your token · QueueCare", robots: { index: false, follow: false } };

const longDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" });

/** The patients ahead as small bars, then you (at most 8 bars, so it fits a phone). */
function Track({ ahead }: { ahead: number }) {
  return (
    <div aria-hidden="true" className="mt-[26px] mb-2.5 flex gap-1.5">
      {Array.from({ length: Math.min(ahead, 8) }, (_, i) => (
        <i key={i} className="h-3 flex-1 rounded-md bg-sage" />
      ))}
      <i className="h-3 flex-1 rounded-md bg-primary" />
    </div>
  );
}

function Advice({ ahead }: { ahead: number }) {
  const advice = stepOutAdvice(ahead);
  if (advice === "step-out") {
    return (
      <p className="mt-[18px] border-l-[3px] border-primary py-1 pl-3.5 text-[15px]">
        You can step out. Come back when {COME_BACK_AT} patients are ahead; this page will tell you.
      </p>
    );
  }
  return (
    <p className="mt-[18px] rounded-r-xl border-l-[3px] border-[#f2b544] bg-[#fff8e8] px-3.5 py-3 text-[15px]">
      {advice === "next" ? (
        <>
          <b>You are next.</b> Please stay in the waiting room.
        </>
      ) : (
        <>
          <b>Please come back to the waiting room now.</b> Only {ahead} {ahead === 1 ? "patient is" : "patients are"}{" "}
          ahead of you.
        </>
      )}
    </p>
  );
}

function Body({ status }: { status: PatientStatus }) {
  switch (status.state) {
    case "waiting": {
      const ahead = status.estimate.patientsAhead;
      return (
        <>
          <Track ahead={ahead} />
          <p data-testid="status-message" className="text-xl font-semibold">
            {ahead === 0 ? "You are next" : `${ahead} ${ahead === 1 ? "patient" : "patients"} ahead of you`}
          </p>
          {ahead > 0 && (
            <div className="mt-[18px] rounded-2xl bg-secondary p-[18px]">
              <strong className="block text-[40px] leading-[1.05] font-normal text-primary">
                {formatRange(status.estimate)}
              </strong>
              <span className="mt-1 block text-sm text-[#3e5348]">Expected wait. It updates by itself.</span>
            </div>
          )}
          <Advice ahead={ahead} />
          <p className="mt-auto pt-[18px] text-[13px] text-muted-foreground">
            With the doctor now:{" "}
            <b className="token-type text-xl font-normal text-foreground">{status.withDoctor ?? "nobody"}</b>
          </p>
        </>
      );
    }
    case "called":
      // The whole screen turns green, so it can't be missed; role="alert" reads it out.
      return (
        <div
          role="alert"
          data-fullscreen
          data-testid="status-message"
          className="fixed inset-0 z-50 flex flex-col justify-center bg-success p-7 text-white animate-in slide-in-from-bottom duration-500 motion-reduce:animate-none"
        >
          <p className="token-type text-[120px]">{status.token}</p>
          <h2 className="mt-4 mb-2.5 text-[44px] leading-[1.05]">Please go in now</h2>
          <p className="text-[17px] opacity-90">The doctor is ready to see you.</p>
        </div>
      );
    case "done":
      return (
        <div data-testid="status-message">
          <p className="mt-[26px] mb-1.5 text-[22px] font-semibold">Your visit is finished</p>
          <p className="text-sm text-muted-foreground">Thank you. You can close this page.</p>
        </div>
      );
    case "missed":
      return (
        <p data-testid="status-message" className="mt-[26px] text-[22px] font-semibold">
          You were marked as missed. Please speak to reception.
        </p>
      );
    case "another-day":
      return (
        <p data-testid="status-message" className="mt-[26px] text-[22px] font-semibold">
          This token was for {longDate.format(new Date(status.visitDate))}. Ask reception for today&apos;s token.
        </p>
      );
  }
}

/**
 * What a patient sees after scanning their token: no sign-in, only their own token. It updates
 * by itself (the Live indicator is in the top bar).
 */
export default async function StatusPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^[0-9a-f]{32}$/.test(code)) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("visit_status", { p_code: code });
  if (error) throw error;
  if (!data) notFound();

  const status = describeStatus(data as StatusResponse, new Date());

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-4.5rem)] max-w-md flex-col py-[22px]">
      <span className="text-sm text-muted-foreground">Your token</span>
      <h1 data-testid="status-token" className="token-type mt-1 text-[104px] text-primary">
        {status.token}
      </h1>
      <Body status={status} />
    </section>
  );
}
