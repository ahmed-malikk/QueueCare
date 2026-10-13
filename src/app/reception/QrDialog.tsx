"use client";

import { Dialog } from "radix-ui";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { useOrigin } from "@/lib/useOrigin";

/**
 * A large QR code for one patient's status page, for a patient who lost theirs or wants to scan
 * it again. Opened from a queue row or from the token just issued. Radix handles the dialog's
 * focus (it moves into the dialog and back to the button that opened it) and Escape to close.
 */
export function QrDialog({
  token,
  statusPath,
  children,
}: {
  token: string;
  statusPath: string;
  children: React.ReactNode; // the button that opens it
}) {
  const origin = useOrigin();
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[rgb(22_32_26/0.45)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 motion-reduce:animate-none" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[min(380px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2 rounded-[20px] bg-card p-[26px] text-center shadow-2xl outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.94] data-[state=open]:slide-in-from-bottom-3 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 motion-reduce:animate-none">
          <Dialog.Title className="token-type text-[72px] leading-none text-primary">{token}</Dialog.Title>
          <div
            role="img"
            aria-label={`QR code for token ${token}`}
            data-status-path={statusPath}
            className="mx-auto my-3.5 size-[180px]"
          >
            <QRCodeSVG value={`${origin}${statusPath}`} size={180} marginSize={0} aria-hidden="true" />
          </div>
          <Dialog.Description className="mb-4 text-muted-foreground">
            Ask the patient to scan this to follow the queue on their phone.
          </Dialog.Description>
          <div className="flex gap-2">
            <Dialog.Close asChild>
              <Button className="h-11 flex-1 font-semibold">Done</Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
