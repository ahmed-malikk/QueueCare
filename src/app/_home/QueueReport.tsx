"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { demoQueue, WITH_DOCTOR, YOUR_TOKEN } from "@/lib/demoQueue";
import { formatToken } from "@/lib/registration";

const BEFORE = demoQueue(false);
const AFTER = demoQueue(true);
const YOU = formatToken(YOUR_TOKEN);

/** How long the report rests on the "before" queue once it is on screen, so visitors can read it first. */
const FIRST_PLAY_DELAY_MS = 1400;
const REPLAY_DELAY_MS = 700;
/** A fast start that settles gently, like a slip pressed into place. */
const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";

const FLAG = ["", "H", "H!"] as const;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * The home page's live example: a queue report for token A-14. A moment after it comes into view,
 * an emergency (A-16) arrives: its row is stamped in at the top, the other rows slide down and
 * the estimate grows. Then everything stays still. "Watch an emergency arrive" plays it again.
 *
 * The rows move with the FLIP technique: note where each row was, let React re-order them,
 * then animate each row from its old position to its new one.
 */
export function QueueReport({ replayButtonId }: { replayButtonId: string }) {
  const [arrived, setArrived] = useState(false);
  const rowRefs = useRef(new Map<string, HTMLTableRowElement>());
  const lastTops = useRef(new Map<string, number>());
  const resultsRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const figureRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);
  const state = arrived ? AFTER : BEFORE;

  // Play once when at least half the report is on screen (on a phone it starts below the fold),
  // or show the end state at once if motion is reduced.
  useEffect(() => {
    if (prefersReducedMotion()) {
      setArrived(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        timer.current = setTimeout(() => setArrived(true), FIRST_PLAY_DELAY_MS);
      },
      { threshold: 0.5 },
    );
    if (figureRef.current) observer.observe(figureRef.current);
    return () => {
      observer.disconnect();
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  // The replay button sits in the hero text, outside this component.
  useEffect(() => {
    const button = document.getElementById(replayButtonId);
    if (!button) return;
    const replay = () => {
      if (timer.current) clearTimeout(timer.current);
      setArrived(false);
      timer.current = setTimeout(() => setArrived(true), REPLAY_DELAY_MS);
      // On a phone the report is below the button: bring it into view.
      if (window.innerWidth < 1024) {
        figureRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
      }
    };
    button.addEventListener("click", replay);
    return () => button.removeEventListener("click", replay);
  }, [replayButtonId]);

  // After React re-orders the rows (and before the browser paints), animate the change.
  useLayoutEffect(() => {
    const rows = rowRefs.current;
    if (firstRender.current || prefersReducedMotion()) {
      firstRender.current = false;
    } else {
      for (const [token, row] of rows) {
        const before = lastTops.current.get(token);
        const now = row.getBoundingClientRect().top;
        if (before === undefined) {
          // The new row: pressed in from the top edge, its red wash settling to the resting tint.
          row.animate(
            [
              { clipPath: "inset(0 0 100% 0)", backgroundColor: "color-mix(in oklch, var(--emergency) 22%, var(--emergency-soft))" },
              { clipPath: "inset(0 0 0 0)", backgroundColor: "color-mix(in oklch, var(--emergency) 22%, var(--emergency-soft))", offset: 0.35 },
              { clipPath: "inset(0 0 0 0)", backgroundColor: "var(--emergency-soft)" },
            ],
            { duration: 1800, easing: EASE_OUT },
          );
          row.querySelector("[data-flag]")?.animate(
            [
              { transform: "scale(1.9)", opacity: 0 },
              { transform: "scale(1)", opacity: 1 },
            ],
            { duration: 380, delay: 320, easing: EASE_OUT, fill: "backwards" },
          );
        } else if (before !== now) {
          row.animate([{ transform: `translateY(${before - now}px)` }, { transform: "translateY(0)" }], {
            duration: 620,
            easing: EASE_OUT,
          });
        }
      }
      // The results settle into their new values, slightly blurred as they move.
      resultsRef.current?.querySelectorAll("[data-changes]").forEach((value) => {
        value.animate(
          [
            { transform: "translateY(-0.35em)", filter: "blur(3px)", opacity: 0 },
            { transform: "translateY(0)", filter: "blur(0)", opacity: 1 },
          ],
          { duration: 700, delay: 260, easing: EASE_OUT, fill: "backwards" },
        );
      });
    }
    lastTops.current = new Map([...rows].map(([token, row]) => [token, row.getBoundingClientRect().top]));
  }, [arrived]);

  return (
    <figure ref={figureRef} className="report w-full rounded-xl border bg-card p-4 shadow-[0_18px_40px_-12px_oklch(0.24_0.025_215/0.18)] sm:p-6">
      <div className="flex items-baseline justify-between gap-3 border-b-[3px] border-double border-foreground pb-2.5">
        <p className="text-xs font-bold tracking-[0.12em] uppercase">Queue report · token {YOU}</p>
        <p className="text-xs text-muted-foreground">Example</p>
      </div>

      <div ref={resultsRef} className="grid grid-cols-3 border-b">
        <Result label="Patients ahead" value={String(state.ahead)} changes />
        <Result label="Expected wait, min" value={`${state.low}–${state.high}`} accent changes />
        <Result label="With the doctor" value={WITH_DOCTOR} />
      </div>

      <table className="mt-2 w-full border-collapse tabular-nums">
        <caption className="sr-only">The queue, in the order the doctor will see patients</caption>
        <thead>
          <tr className="border-b border-foreground text-left text-[0.6875rem] tracking-[0.08em] text-muted-foreground uppercase">
            <th scope="col" className="hidden w-8 py-2 font-semibold sm:table-cell">#</th>
            <th scope="col" className="py-2 font-semibold">Token</th>
            <th scope="col" className="py-2 font-semibold">Priority</th>
            <th scope="col" className="py-2 text-right font-semibold">Waited</th>
            <th scope="col" className="w-10 py-2 text-right font-semibold">
              <span aria-hidden="true">Flag</span>
              <span className="sr-only">Priority flag</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {state.rows.map((row, index) => (
            <tr
              key={row.token}
              ref={(element) => {
                if (element) rowRefs.current.set(row.token, element);
                else rowRefs.current.delete(row.token);
              }}
              className={cn(
                "border-b last:border-b-0",
                row.you && "bg-secondary",
                row.isNew && "bg-emergency-soft",
              )}
            >
              <td className="hidden py-2 text-sm text-muted-foreground sm:table-cell">{index + 1}</td>
              <td className="py-2">
                <span className="token-type text-2xl">{row.token}</span>
                {row.you && <span className="ml-2 text-xs font-semibold text-secondary-foreground">You</span>}
              </td>
              <td className="py-2 text-sm">{row.label}</td>
              <td className="py-2 text-right text-sm text-muted-foreground">{row.waited} min</td>
              <td className="py-2 text-right">
                <span
                  data-flag
                  aria-hidden="true"
                  className={cn("inline-block font-extrabold", row.level === 2 ? "text-emergency" : "text-urgent")}
                >
                  {FLAG[row.level]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <figcaption className="mt-3 text-xs text-muted-foreground">
        H marks a higher priority. Example data, ordered by the same rules as the live app.
      </figcaption>
      {/* Announces the change to screen readers; always on the page so it is read out. */}
      <p role="status" className="sr-only">
        {arrived
          ? `Emergency ${AFTER.rows[0].token} arrived and went to the top. ${AFTER.ahead} patients are now ahead of ${YOU}, about ${AFTER.low} to ${AFTER.high} minutes.`
          : ""}
      </p>
    </figure>
  );
}

function Result({ label, value, accent, changes }: { label: string; value: string; accent?: boolean; changes?: boolean }) {
  return (
    <div className="py-3 pr-2">
      <p
        data-changes={changes || undefined}
        className={cn("token-type text-4xl sm:text-5xl", accent && "text-primary")}
      >
        {value}
      </p>
      <p className="mt-1.5 text-[0.6875rem] leading-tight tracking-[0.06em] text-muted-foreground uppercase">{label}</p>
    </div>
  );
}
