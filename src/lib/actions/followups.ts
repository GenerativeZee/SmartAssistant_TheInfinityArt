"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { addDaysIST, todayIST } from "@/lib/dates";
import type { ActionResult } from "@/lib/actions/quotations";

export async function completeFollowUp(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("follow_ups")
    .update({ status: "done", completed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/aaj");
  return { ok: true };
}

/** Snooze to tomorrow (or a picked date) — it reappears, never silently dropped (§6.5). */
export async function snoozeFollowUp(id: string, toDate?: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("follow_ups")
    .update({ status: "snoozed", snoozed_to: toDate || addDaysIST(todayIST(), 1) })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/aaj");
  return { ok: true };
}

/** Only an explicit drop, and it asks why (§6.5). */
export async function dropFollowUp(id: string, reason: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("follow_ups")
    .update({ status: "dropped", drop_reason: reason || null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/aaj");
  return { ok: true };
}
