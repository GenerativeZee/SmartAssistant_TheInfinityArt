"use server";

import { revalidatePath } from "next/cache";
import { createClient, getProfile } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/quotations";
import { expenseInputSchema } from "@/lib/validation/expenses";

/** §5 — capture only, no reporting in Phase 1. */
export async function addExpense(raw: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = expenseInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const input = parsed.data;

  const profile = await getProfile();
  if (!profile) return { ok: false, error: "Please sign in" };
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("expenses")
    .insert({
      shop_id: profile.shop_id,
      category: input.category,
      amount: input.amount,
      spent_on: input.spentOn,
      note: input.note || null,
      job_id: input.jobId || null,
      created_by: profile.id,
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "Could not save the expense" };

  revalidatePath("/settings/expenses");
  return { ok: true, id: data.id };
}

/** Pure capture log, no downstream dependents — fixing a fat-finger entry is safe. */
export async function deleteExpense(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/settings/expenses");
  return { ok: true };
}
