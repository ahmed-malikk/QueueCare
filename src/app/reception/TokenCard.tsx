"use client";

import { QRCodeSVG } from "qrcode.react";
import { Clock, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEstimate } from "@/lib/waitText";
import type { IssuedToken } from "./actions";

/** The token just issued: big number, QR code for the patient's phone, and their status link. */
export function TokenCard({ issued }: { issued: IssuedToken }) {
  // Only shown after a registration, so we're in the browser and know the site's own address.
  // (Never build it from request headers: the browser controls those.)
  const statusUrl = `${window.location.origin}${issued.statusPath}`;

  return (
    <Card className="border-primary/30 shadow-sm">
      <CardHeader className="text-center">
        <CardDescription>Token issued for {issued.patientName}</CardDescription>
        <CardTitle>
          <p data-testid="issued-token" className="font-mono text-6xl font-bold tracking-tight text-primary tabular-nums">
            {issued.token}
          </p>
        </CardTitle>
        <p className="inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="size-4" aria-hidden="true" /> {formatEstimate(issued.estimate)}
        </p>
      </CardHeader>
      <CardContent className="grid justify-items-center gap-3">
        <div role="img" aria-label={`QR code for token ${issued.token}`} className="rounded-lg border bg-white p-3">
          <QRCodeSVG value={statusUrl} size={168} marginSize={0} aria-hidden="true" />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          The patient scans this to follow their place in the queue.
        </p>
        <a
          href={issued.statusPath}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Open status page <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
      </CardContent>
    </Card>
  );
}
