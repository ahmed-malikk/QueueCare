"use client";

import { useRef } from "react";
import { Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { CLINIC_TIME_ZONE } from "@/lib/clinicTime";
import { useOrigin } from "@/lib/useOrigin";

const printedAt = new Intl.DateTimeFormat("en-GB", {
  timeZone: CLINIC_TIME_ZONE,
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

/** Text placed inside the slip's HTML: never let a patient's input become markup. */
function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/**
 * Prints a receipt-sized token slip (72 mm wide, for a receipt printer or any printer): the
 * token, the expected wait and the QR code, nothing else from the screen. It writes the slip
 * into a hidden frame and opens the browser's normal print dialog for that frame.
 */
export function PrintTokenButton({
  token,
  waitText,
  statusPath,
  className,
}: {
  token: string;
  waitText?: string;
  statusPath: string;
  className?: string;
}) {
  const origin = useOrigin();
  const qrRef = useRef<HTMLDivElement>(null);

  function print() {
    const qr = qrRef.current?.innerHTML ?? "";
    const slip = `<!doctype html><html><head><meta charset="utf-8"><title>Token ${escapeHtml(token)}</title>
<style>
  @page { size: 72mm auto; margin: 4mm; }
  body { margin: 0; font-family: system-ui, sans-serif; text-align: center; color: #000; }
  .name { font-size: 11pt; }
  .token { font-size: 48pt; line-height: 1; margin: 2mm 0; }
  .wait { font-size: 12pt; font-weight: 600; margin-bottom: 3mm; }
  svg { width: 38mm; height: 38mm; }
  .hint, .time { font-size: 9pt; margin-top: 2mm; }
</style></head><body>
  <div class="name">QueueCare</div>
  <div class="token">${escapeHtml(token)}</div>
  ${waitText ? `<div class="wait">${escapeHtml(waitText)}</div>` : ""}
  ${qr}
  <div class="hint">Scan to follow your place in the queue</div>
  <div class="time">${escapeHtml(printedAt.format(new Date()))}</div>
</body></html>`;

    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.style.cssText = "position:fixed;width:0;height:0;border:0;opacity:0;pointer-events:none";
    frame.onload = () => {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
      // The print dialog blocks until it is closed; remove the frame after that.
      setTimeout(() => frame.remove(), 1000);
    };
    frame.srcdoc = slip;
    document.body.appendChild(frame);
  }

  return (
    <>
      <Button type="button" onClick={print} className={className}>
        <Printer /> Print token
      </Button>
      {/* The QR code for the slip, drawn once and copied into the printed page. */}
      <div ref={qrRef} hidden>
        <QRCodeSVG value={`${origin}${statusPath}`} size={144} marginSize={0} />
      </div>
    </>
  );
}
