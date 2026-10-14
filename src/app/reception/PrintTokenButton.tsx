"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

/**
 * Prints a receipt-sized token slip (72 mm wide): the token, the expected wait and the QR code,
 * nothing else from the screen.
 *
 * The slip is a hidden block placed directly in <body>. Pressing the button marks it as the
 * thing to print and calls window.print() on the page itself; the print rules in globals.css
 * then hide everything except the slip. (An earlier version printed from a hidden frame, which
 * Chrome on phones blocks: only the frame that received the tap may print.)
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
  const slipRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function print() {
    const slip = slipRef.current;
    if (!slip) return;
    if (timeRef.current) timeRef.current.textContent = printedAt.format(new Date());
    slip.setAttribute("data-printing", "");
    window.addEventListener("afterprint", () => slip.removeAttribute("data-printing"), { once: true });
    window.print();
  }

  return (
    <>
      <Button type="button" onClick={print} className={className}>
        <Printer /> Print token
      </Button>
      {mounted &&
        createPortal(
          <div ref={slipRef} className="print-slip" aria-hidden="true">
            <div className="name">QueueCare</div>
            <div className="token">{token}</div>
            {waitText && <div className="wait">{waitText}</div>}
            <QRCodeSVG value={`${origin}${statusPath}`} size={144} marginSize={0} />
            <div className="hint">Scan to follow your place in the queue</div>
            <div className="time" ref={timeRef} />
          </div>,
          document.body,
        )}
    </>
  );
}
