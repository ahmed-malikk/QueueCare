"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * This site's own address (e.g. https://queuecare-zeta.vercel.app), for building full links
 * such as the QR code's. On the server there is no browser address, so it is "" there and
 * React fills in the real one in the browser, without a mismatch warning.
 * (Never build it from request headers: the browser controls those.)
 */
export function useOrigin(): string {
  return useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => "",
  );
}
