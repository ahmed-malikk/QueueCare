"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Status = "connecting" | "live" | "reconnecting";

const SAFETY_REFRESH_MS = 30_000;

/**
 * Keeps a page up to date without refreshing. It listens to queue_ticks, a one-row table the
 * database touches whenever any visit changes (it holds no patient data, so public pages can
 * listen too). On a change it re-loads the page's data from the server, which re-applies the
 * same rules and permissions as a normal page load. The pill shows whether the link is live.
 *
 * Safety net: a message can be lost (a slow network, a brief disconnect), so the page also
 * refreshes when the connection comes back and every 30 seconds.
 */
export function LiveRefresh({ tone = "light" }: { tone?: "light" | "dark" }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("connecting");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let dropped = false;
    const channel = supabase
      .channel("queue-ticks")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "queue_ticks" }, () => {
        // Several changes can arrive together (finish one patient, call the next): refresh once.
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => router.refresh(), 100);
      })
      .subscribe((state) => {
        if (state === "SUBSCRIBED") {
          setStatus("live");
          if (dropped) router.refresh(); // back after a drop: catch up on anything missed
          dropped = false;
        } else if (state === "CHANNEL_ERROR" || state === "TIMED_OUT" || state === "CLOSED") {
          setStatus("reconnecting");
          dropped = true;
        }
      });
    const safety = setInterval(() => router.refresh(), SAFETY_REFRESH_MS);

    return () => {
      clearInterval(safety);
      if (timer.current) clearTimeout(timer.current);
      supabase.removeChannel(channel);
    };
  }, [router]);

  return (
    <span
      role="status"
      data-testid="live-status"
      data-state={status}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tone === "dark"
          ? "border-white/25 text-white/80"
          : status === "live"
            ? "border-success/30 text-success"
            : "text-muted-foreground",
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-2 rounded-full", status === "live" ? "animate-pulse bg-success" : "bg-muted-foreground")}
      />
      {status === "live" ? "Live" : status === "connecting" ? "Connecting…" : "Reconnecting…"}
    </span>
  );
}
