"use server";

import { refresh } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/dal";
import { getWaitingToday, getWithDoctorToday } from "@/lib/queueData";
import { planCallNext } from "@/lib/callNext";
import { formatToken } from "@/lib/registration";

export type CallNextResult = { ok: true; called: string | null } | { ok: false; message: string };

/**
 * Runs when the doctor presses Call next: the patient with the doctor is finished, and the
 * highest-priority waiting patient is called. The decision is planCallNext (pure, tested);
 * this function only reads the queue and saves the result.
 */
export async function callNext(): Promise<CallNextResult> {
  const user = await getCurrentUser();
  if (user?.role !== "doctor") return { ok: false, message: "Only the doctor can call the next patient." };

  const supabase = await createClient();
  const now = new Date();
  let plan;
  try {
    const [waiting, withDoctor] = await Promise.all([
      getWaitingToday(supabase, now),
      getWithDoctorToday(supabase, now),
    ]);
    plan = planCallNext(waiting, withDoctor, now);
  } catch {
    return { ok: false, message: "The queue couldn't be read. Check the connection and try again." };
  }

  const stamp = now.toISOString();
  if (plan.finishId) {
    const { error } = await supabase
      .from("visits")
      .update({ status: "done", done_at: stamp })
      .eq("id", plan.finishId)
      .eq("status", "called");
    if (error) return { ok: false, message: "The current patient couldn't be finished. Try again." };
  }

  let called: string | null = null;
  if (plan.call) {
    // Only call someone who is still waiting: if reception changed something in the same
    // instant, nothing is overwritten and the doctor is asked to press again.
    const { data, error } = await supabase
      .from("visits")
      .update({ status: "called", called_at: stamp, called_out_of_order: plan.call.outOfOrder })
      .eq("id", plan.call.id)
      .eq("status", "waiting")
      .select("token_number");
    if (error) return { ok: false, message: "The next patient couldn't be called. Try again." };
    if (!data || data.length === 0) return { ok: false, message: "The queue just changed. Press Call next again." };
    called = formatToken(data[0].token_number);
  }

  refresh();
  return { ok: true, called };
}
