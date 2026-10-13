"use client";

import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { useOrigin } from "@/lib/useOrigin";
import { formatEstimate } from "@/lib/waitText";
import { QrDialog } from "./QrDialog";
import type { IssuedToken } from "./actions";

/**
 * The token just issued, under the form: who it's for, the number, the expected wait and the
 * QR code the patient scans. The QR code is also a link, so reception can open the status page.
 * It slides out like a slip leaving a printer.
 */
export function TokenCard({ issued }: { issued: IssuedToken }) {
  const statusUrl = `${useOrigin()}${issued.statusPath}`;

  return (
    <div className="mt-[18px] overflow-hidden">
      <div className="slip-print grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 rounded-xl border border-dashed border-slip-edge bg-background p-[18px]">
        <p className="col-span-2 text-[13px] text-muted-foreground">Token for {issued.patientName}</p>
        <p data-testid="issued-token" className="token-type text-[64px] leading-none text-primary">
          {issued.token}
        </p>
        <a
          href={issued.statusPath}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open status page for ${issued.token}`}
          className="row-span-2 rounded-lg bg-white p-1.5 transition-transform duration-200 hover:scale-105 motion-reduce:hover:scale-100"
        >
          <span role="img" aria-label={`QR code for token ${issued.token}`} className="block size-20">
            <QRCodeSVG value={statusUrl} size={80} marginSize={0} aria-hidden="true" />
          </span>
        </a>
        <p className="text-sm font-semibold">{formatEstimate(issued.estimate)}</p>
        <div className="col-span-2 mt-3 flex gap-2">
          <QrDialog token={issued.token} statusPath={issued.statusPath}>
            <Button variant="outline" className="h-10 flex-1 border-[1.5px] border-primary font-semibold text-primary">
              Show QR
            </Button>
          </QrDialog>
        </div>
      </div>
    </div>
  );
}
