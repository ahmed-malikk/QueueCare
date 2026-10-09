import type { Metadata } from "next";
import { LiveRefresh } from "@/components/LiveRefresh";
import { LogoMark } from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";
import { describeWaitingRoom, type WaitingRoomResponse } from "@/lib/waitingRoom";
import { Clock } from "./Clock";

export const metadata: Metadata = { title: "Now serving · QueueCare", robots: { index: false, follow: false } };

/**
 * The waiting-room screen, for a TV across the room: very large tokens, no names.
 * It covers the whole window (no site header or footer) and updates live.
 */
export default async function DisplayPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("waiting_room");
  if (error) throw error;
  const view = describeWaitingRoom(data as WaitingRoomResponse);

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-auto bg-foreground px-6 py-5 text-white sm:px-12 sm:py-8">
      <header className="flex items-center justify-between gap-4 text-lg text-white/70 sm:text-2xl">
        <span className="inline-flex items-center gap-3">
          <LogoMark className="size-8" /> QueueCare
        </span>
        <span className="inline-flex items-center gap-4">
          <LiveRefresh tone="dark" />
          <Clock />
        </span>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center py-8 text-center">
        <h1 className="text-2xl font-semibold text-white/80 sm:text-4xl">Now serving</h1>
        <p
          data-testid="now-serving"
          className="token-type mt-2 text-[34vw] text-slip sm:text-[22vw] lg:text-[18rem]"
        >
          {view.nowServing ?? "–"}
        </p>
        {view.priorityCalled && (
          <p data-testid="priority-called" className="mt-2 rounded-sm bg-urgent px-5 py-2 text-xl font-semibold sm:text-3xl">
            Priority patient called
          </p>
        )}
        {!view.nowServing && <p className="mt-4 text-xl text-white/60">The doctor will call the first patient soon.</p>}
      </main>

      <footer className="border-t border-white/15 pt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="text-xl text-white/70 sm:text-3xl">Next</h2>
          <p className="text-lg text-white/60 sm:text-2xl">{view.waitingCount} waiting</p>
        </div>
        <ol aria-label="Next tokens" className="mt-3 flex flex-wrap gap-x-12 gap-y-2">
          {view.next.length === 0 ? (
            <li className="text-xl text-white/60">Nobody is waiting.</li>
          ) : (
            view.next.map((token) => (
              <li key={token} data-testid="next-token" className="token-type text-7xl sm:text-9xl">
                {token}
              </li>
            ))
          )}
        </ol>
      </footer>
    </div>
  );
}
