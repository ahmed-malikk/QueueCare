"use client";

import { useEffect, useState } from "react";
import { CLINIC_TIME_ZONE } from "@/lib/clinicTime";

const format = new Intl.DateTimeFormat("en-GB", { timeZone: CLINIC_TIME_ZONE, hour: "2-digit", minute: "2-digit" });

/** The clinic's time, so people waiting can judge the estimate. Empty until it runs in the browser. */
export function Clock() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setTime(format.format(new Date()));
    tick();
    const timer = setInterval(tick, 15_000);
    return () => clearInterval(timer);
  }, []);
  return <span className="tabular-nums">{time}</span>;
}
