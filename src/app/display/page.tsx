import type { Metadata } from "next";
import { LiveRefresh } from "@/components/LiveRefresh";
import { LogoMark } from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";
import { describeWaitingRoom, type WaitingRoomResponse } from "@/lib/waitingRoom";
import { Clock } from "./Clock";

export const metadata: Metadata = { title: "Now serving · QueueCare", robots: { index: false, follow: false } };

const PLACES = ["Next in line", "After that", "Then"];

/**
 * The waiting-room screen, for a TV across the room: very large tokens, no names. It covers the
 * whole window (no site header or footer) and updates live. A new token rises into place.
 */
export default async function DisplayPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("waiting_room");
  if (error) throw error;
  const view = describeWaitingRoom(data as WaitingRoomResponse);

  return (
    <div
      data-fullscreen
      className="fixed inset-0 z-50 flex flex-col overflow-auto bg-[#14281f] px-5 pt-5 pb-7 text-white sm:px-12 sm:pt-7 sm:pb-9"
    >
      <header className="flex items-center justify-between gap-4 text-xl text-[#c4d7cb] sm:text-2xl">
        <span className="inline-flex items-center gap-2.5 text-[28px] text-white">
          <LogoMark className="size-[34px]" /> QueueCare
        </span>
        <span className="inline-flex items-center gap-5">
          <LiveRefresh tone="dark" />
          <Clock />
        </span>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center py-2.5 text-center">
        <h1 className="text-[clamp(26px,3vw,40px)] font-medium text-[#c4d7cb]">Now serving</h1>
        <p
          key={view.nowServing ?? "none"}
          data-testid="now-serving"
          className="token-type my-1.5 text-[min(22vw,30vh)] leading-none text-white animate-in fade-in-0 slide-in-from-bottom-10 duration-700 motion-reduce:animate-none"
        >
          {view.nowServing ?? "–"}
        </p>
        {!view.nowServing && <p className="text-2xl text-[#c4d7cb]">The doctor will call the first patient soon.</p>}
      </main>

      <footer className="grid grid-cols-[1fr_auto] items-baseline gap-y-3.5">
        <h2 className="text-[26px] font-medium text-[#c4d7cb]">Coming up</h2>
        <p className="text-[22px] text-[#c4d7cb]">{view.waitingCount} waiting</p>
        <ol aria-label="Next tokens" className="col-span-2 grid grid-cols-3 gap-4">
          {view.next.length === 0 ? (
            <li className="col-span-3 text-[26px] text-[#c4d7cb]">Nobody is waiting</li>
          ) : (
            view.next.map((token, index) => (
              <li
                key={token}
                className="flex flex-col gap-1 rounded-[18px] border border-white/12 bg-white/7 px-[22px] pt-3.5 pb-[18px] animate-in fade-in-0 slide-in-from-right-3 duration-500 motion-reduce:animate-none"
              >
                <span className="text-[min(1.8vw,2.6vh)] text-[#c4d7cb]">{PLACES[index]}</span>
                <b data-testid="next-token" className="token-type text-[min(6.2vw,9.5vh)] font-normal text-white">
                  {token}
                </b>
              </li>
            ))
          )}
        </ol>
      </footer>
    </div>
  );
}
