"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * The home page's illustration: one patient's token moving from reception, through the live
 * queue, to the doctor, including an emergency that goes to the top. It is a picture of how
 * QueueCare works (fixed example data), not the live queue. Respects reduced motion: then it
 * shows the end state without moving.
 */

type Row = { token: string; info: string; level: 0 | 1 | 2; label: string };

const START: Row[] = [
  { token: "A-09", info: "Waiting 41 min", level: 1, label: "Urgent" },
  { token: "A-11", info: "Booked 7:30", level: 0, label: "Normal" },
  { token: "A-12", info: "Walk-in", level: 0, label: "Normal" },
];

const TAG = [
  "bg-secondary text-primary",
  "bg-urgent-soft text-urgent",
  "bg-emergency-soft text-emergency",
];

function rowHtml(row: Row, fresh = false) {
  return `<li data-token="${row.token}" class="grid grid-cols-[48px_1fr_auto] items-center gap-2 border-t border-[#eef2ef] bg-card px-1.5 py-2 text-[12.5px] first:border-t-0${fresh ? " fresh" : ""}">
    <b class="token-type text-[19px] font-normal text-primary">${row.token}</b><span>${row.info}</span>
    <span class="rounded-full px-2 py-0.5 text-xs font-semibold ${TAG[row.level]}">${row.label}</span></li>`;
}

export function HomeJourney() {
  const stage = useRef<HTMLDivElement>(null);
  const running = useRef(false);

  const play = useCallback(async () => {
    const root = stage.current;
    if (!root || running.current) return;
    running.current = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const $ = (id: string) => root.querySelector<HTMLElement>(`[data-id="${id}"]`)!;
    const list = $("queue") as HTMLOListElement;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
    const ease = "cubic-bezier(.2,.8,.2,1)";

    const centre = (el: HTMLElement, side: "l" | "r") => {
      const s = root.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return { x: (side === "r" ? r.right : r.left) - s.left, y: r.top + r.height / 2 - s.top };
    };
    const curve = (p: { x: number; y: number }, q: { x: number; y: number }) =>
      `M${p.x},${p.y} C${(p.x + q.x) / 2},${p.y} ${(p.x + q.x) / 2},${q.y} ${q.x},${q.y}`;
    const wide = () => window.innerWidth > 900;
    const drawWires = () => {
      if (!wide()) return;
      $("w1").setAttribute("d", curve(centre($("reg"), "r"), centre($("queueCard"), "l")));
      $("w2").setAttribute("d", curve(centre($("queueCard"), "r"), centre($("doc"), "l")));
    };
    const travel = async (wire: string, label: string) => {
      const t = $("trav");
      t.textContent = label;
      if (reduce || !wide()) return;
      const path = $(wire) as unknown as SVGPathElement;
      const length = path.getTotalLength();
      const start = performance.now();
      t.style.opacity = "1";
      await new Promise<void>((done) => {
        const step = (now: number) => {
          const k = Math.min(1, (now - start) / 900);
          const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          const p = path.getPointAtLength(length * e);
          t.style.transform = `translate(${p.x - t.offsetWidth / 2}px,${p.y - t.offsetHeight / 2}px)`;
          if (k < 1) requestAnimationFrame(step);
          else done();
        };
        requestAnimationFrame(step);
      });
      t.style.opacity = "0";
    };
    // Rows glide from their old place to their new one (FLIP).
    const flip = (change: () => void) => {
      const before = new Map([...list.children].map((li) => [(li as HTMLElement).dataset.token, li.getBoundingClientRect().top]));
      change();
      if (reduce) return;
      for (const li of [...list.children] as HTMLElement[]) {
        const was = before.get(li.dataset.token);
        const now = li.getBoundingClientRect().top;
        if (was === undefined) li.animate([{ opacity: 0, transform: "translateX(-18px)" }, { opacity: 1, transform: "none" }], { duration: 450, easing: ease });
        else if (was !== now) li.animate([{ transform: `translateY(${was - now}px)` }, { transform: "none" }], { duration: 600, easing: ease });
      }
    };
    const press = async (id: string) => {
      $(id).classList.add("pressed");
      await wait(180);
      $(id).classList.remove("pressed");
    };

    list.innerHTML = START.map((row) => rowHtml(row)).join("");
    $("regTok").textContent = "A-14";
    $("regUrg").innerHTML = `<span class="rounded-full px-2 py-0.5 text-xs font-semibold ${TAG[0]}">Normal</span>`;
    $("docTok").textContent = "A-08";
    $("est").textContent = "15–25 min";
    $("why").style.opacity = "0";
    drawWires();

    await wait(700);
    await press("issue");
    await travel("w1", "A-14");
    flip(() => list.insertAdjacentHTML("beforeend", rowHtml({ token: "A-14", info: "Walk-in", level: 0, label: "Normal" }, true)));
    await wait(1600);

    // An emergency arrives and goes to the top; everyone else keeps their order.
    $("regTok").textContent = "A-15";
    $("regUrg").innerHTML = `<span class="rounded-full px-2 py-0.5 text-xs font-semibold ${TAG[2]}">Emergency</span>`;
    await wait(500);
    await press("issue");
    await travel("w1", "A-15");
    flip(() => list.insertAdjacentHTML("afterbegin", rowHtml({ token: "A-15", info: "Walk-in", level: 2, label: "Emergency" }, true)));
    $("why").style.opacity = "1";
    $("est").textContent = "20–30 min";
    await wait(2000);

    // The doctor calls the next patient.
    $("call").classList.add("pressed");
    await wait(250);
    const first = list.firstElementChild as HTMLElement;
    if (!reduce) await first.animate([{ opacity: 1 }, { opacity: 0, transform: "translateX(24px)" }], { duration: 300, fill: "forwards" }).finished;
    flip(() => first.remove());
    $("why").style.opacity = "0";
    await travel("w2", "A-15");
    $("docTok").textContent = "A-15";
    if (!reduce) $("docTok").animate([{ transform: "scale(.8)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 400, easing: ease });
    $("call").classList.remove("pressed");
    $("est").textContent = "15–25 min";
    running.current = false;
  }, []);

  useEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) play();
    });
    return () => {
      cancelled = true;
    };
  }, [play]);

  const card = "relative z-[1] rounded-[14px] bg-card p-4 shadow-[0_1px_0_rgb(30_59_44/0.06),0_10px_30px_-12px_rgb(30_59_44/0.25)]";
  const cardTitle = "mb-3 text-xs font-semibold text-muted-foreground";

  return (
    <div
      ref={stage}
      className="relative min-h-[520px] overflow-hidden rounded-[22px] bg-mist lg:h-full max-[900px]:min-h-0 max-[900px]:pb-14"
    >
      <svg className="pointer-events-none absolute inset-0 size-full max-[900px]:hidden" aria-hidden="true">
        <path data-id="w1" fill="none" stroke="#8ea59a" strokeWidth="1.4" strokeDasharray="3 5" />
        <path data-id="w2" fill="none" stroke="#8ea59a" strokeWidth="1.4" strokeDasharray="3 5" />
      </svg>
      <div
        role="img"
        aria-label="Animation: a token moves from reception, through the live queue, to the doctor; an emergency goes to the top of the queue"
        className="absolute inset-0 grid grid-cols-[1fr_1.25fr_1fr] items-center gap-[34px] px-[34px] py-10 max-[900px]:relative max-[900px]:grid-cols-1 max-[900px]:gap-[18px] max-[900px]:p-[22px]"
      >
        <div data-id="reg" className={card} aria-hidden="true">
          <h3 className={cardTitle}>Reception</h3>
          <div data-id="regTok" className="token-type text-[34px] leading-none text-primary">A-14</div>
          <div className="flex justify-between border-t border-[#eef2ef] py-1.5 text-xs text-muted-foreground"><span>Visit</span><span>Walk-in</span></div>
          <div className="flex justify-between border-t border-[#eef2ef] py-1.5 text-xs text-muted-foreground"><span>Urgency</span><span data-id="regUrg" /></div>
          <div data-id="issue" className="mt-3 rounded-lg bg-primary p-[9px] text-center text-xs font-semibold text-white transition-transform [&.pressed]:scale-95">
            Issue token
          </div>
        </div>
        <div data-id="queueCard" className={card} aria-hidden="true">
          <h3 className={cardTitle}>Live queue</h3>
          <ol data-id="queue" className="[&_.fresh]:bg-[#f2f8f3]" />
          <div data-id="why" className="mt-2 min-h-4 text-xs text-emergency opacity-0 transition-opacity duration-400">
            Emergency goes first. Everyone else keeps their order.
          </div>
        </div>
        <div data-id="doc" className={card} aria-hidden="true">
          <h3 className={cardTitle}>Doctor</h3>
          <div className="flex min-h-11 items-baseline gap-2.5">
            <span data-id="docTok" className="token-type text-[34px] leading-none text-primary">A-08</span>
            <span className="text-xs text-muted-foreground">with you</span>
          </div>
          <div data-id="call" className="mt-3.5 rounded-lg border-[1.5px] border-primary p-[9px] text-center text-xs font-semibold text-primary transition-colors [&.pressed]:bg-primary [&.pressed]:text-white">
            Call next
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            A-14 expected wait
            <strong data-id="est" className="block text-[22px] font-normal text-foreground">15–25 min</strong>
          </div>
        </div>
      </div>
      <div
        data-id="trav"
        aria-hidden="true"
        className="token-type pointer-events-none absolute top-0 left-0 z-[2] rounded-full bg-primary px-2.5 py-[5px] text-[15px] text-white opacity-0 shadow-[0_6px_16px_-6px_rgb(0_0_0/0.4)]"
      />
      <div className="absolute bottom-[22px] left-[34px] flex items-center gap-2 text-xs text-[#3e5348] max-[900px]:left-[22px]">
        <i className="size-2 rounded-full bg-success" aria-hidden="true" />
        Every screen updates in under a second
      </div>
      <button
        type="button"
        onClick={play}
        className="absolute right-[22px] bottom-4 rounded-full bg-white/70 px-3 py-1.5 text-xs text-primary transition-[translate,background-color] hover:-translate-y-0.5 hover:bg-white motion-reduce:hover:translate-y-0"
      >
        Replay
      </button>
    </div>
  );
}
