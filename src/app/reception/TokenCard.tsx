"use client";

import { QRCodeSVG } from "qrcode.react";
import { TokenSlip } from "@/components/TokenSlip";
import { formatEstimate } from "@/lib/waitText";
import type { IssuedToken } from "./actions";

/** The token just issued, as a slip: number, wait, QR code for the patient's phone, and the link. */
export function TokenCard({ issued }: { issued: IssuedToken }) {
  // Only shown after a registration, so we're in the browser and know the site's own address.
  // (Never build it from request headers: the browser controls those.)
  const statusUrl = `${window.location.origin}${issued.statusPath}`;

  return (
    <TokenSlip print caption={`Token issued for ${issued.patientName}`} token={issued.token} tokenTestId="issued-token">
      <p className="text-base font-semibold text-foreground">{formatEstimate(issued.estimate)}</p>
      <div
        role="img"
        aria-label={`QR code for token ${issued.token}`}
        className="mx-auto mt-4 w-fit rounded-sm bg-white p-3"
      >
        <QRCodeSVG value={statusUrl} size={152} marginSize={0} aria-hidden="true" />
      </div>
      <p className="mt-3">The patient scans this to follow the queue.</p>
      <a
        href={issued.statusPath}
        target="_blank"
        rel="noreferrer"
        className="mt-1 inline-block font-medium text-primary underline-offset-4 hover:underline"
      >
        Open status page
      </a>
    </TokenSlip>
  );
}
