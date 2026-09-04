"use server";

import { revalidatePath } from "next/cache";
import { createClient, getProfile } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/quotations";
import {
  wonInputSchema,
  advanceStageSchema,
  deliverJobSchema,
  cancelJobSchema,
  attachmentSchema,
} from "@/lib/validation/jobs";

/**
 * Mark a quotation won -> create the job (§6.4). One transaction, done inside
 * the M1 convert_quotation_to_job() Postgres function: creates the job,
 * carries the total across, records the advance if given, closes the
 * quotation's open follow-up and schedules the delivery one.
 */
export async function markQuotationWon(raw: unknown): Promise<ActionResult<{ jobId: string }>> {
  const parsed = wonInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { quotationId, promisedDate, startingStage, advanceAmount, advanceMode } = parsed.data;

  const supabase = await createClient();
  const { data: jobId, error } = await supabase.rpc("convert_quotation_to_job", {
    p_quotation_id: quotationId,
    p_promised_date: promisedDate,
    p_starting_stage: startingStage,
    p_advance_amount: advanceAmount,
    p_advance_mode: advanceMode,
  });
  if (error || !jobId) return { ok: false, error: error?.message ?? "Could not create the job" };

  revalidatePath("/quotations");
  revalidatePath("/jobs");
  return { ok: true, jobId: jobId as string };
}

async function recordStageEvent(
  jobId: string,
  toStage: string,
  note: string | undefined,
  currentStage: string,
) {
  const profile = await getProfile();
  const supabase = await createClient();
  await supabase.from("job_stage_events").insert({
    job_id: jobId,
    from_stage: currentStage,
    to_stage: toStage,
    note: note || null,
    by: profile?.id ?? null,
  });
}

/** Advance (or jump) to any non-delivered, non-cancelled stage. */
export async function advanceJobStage(raw: unknown): Promise<ActionResult> {
  const parsed = advanceStageSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { jobId, toStage, note } = parsed.data;

  const supabase = await createClient();
  const { data: job } = await supabase.from("jobs").select("stage").eq("id", jobId).single();
  if (!job) return { ok: false, error: "Job not found" };

  await recordStageEvent(jobId, toStage, note, job.stage);

  const { error } = await supabase.from("jobs").update({ stage: toStage }).eq("id", jobId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
  return { ok: true };
}

/**
 * Delivery: stamps stage='delivered' (the M1 trigger sets delivered_at and,
 * if a balance remains, schedules the +7 day payment-reminder follow-up),
 * and optionally records the final payment received at handover.
 */
export async function deliverJob(raw: unknown): Promise<ActionResult> {
  const parsed = deliverJobSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { jobId, note, finalAmount, finalMode } = parsed.data;

  const profile = await getProfile();
  if (!profile) return { ok: false, error: "Please sign in" };
  const supabase = await createClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("stage, client_id, shop_id")
    .eq("id", jobId)
    .single();
  if (!job) return { ok: false, error: "Job not found" };

  await recordStageEvent(jobId, "delivered", note, job.stage);

  // Record the payment *before* flipping the stage: the M1 trigger that fires
  // on the stage change computes the remaining balance in the same instant,
  // so a payment inserted afterwards would leave a "payment reminder"
  // follow-up nagging about money that was, in fact, already collected.
  if (finalAmount > 0) {
    await supabase.from("payments").insert({
      shop_id: job.shop_id,
      client_id: job.client_id,
      job_id: jobId,
      kind: "final",
      amount: finalAmount,
      mode: finalMode,
      received_at: new Date().toISOString(),
      note: "Recorded at delivery",
      created_by: profile.id,
    });
  }

  const { error } = await supabase.from("jobs").update({ stage: "delivered" }).eq("id", jobId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/paisa");
  return { ok: true };
}

export async function cancelJob(raw: unknown): Promise<ActionResult> {
  const parsed = cancelJobSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { jobId, note } = parsed.data;

  const supabase = await createClient();
  const { data: job } = await supabase.from("jobs").select("stage").eq("id", jobId).single();
  if (!job) return { ok: false, error: "Job not found" };

  await recordStageEvent(jobId, "cancelled", note, job.stage);

  const { error } = await supabase.from("jobs").update({ stage: "cancelled" }).eq("id", jobId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
  return { ok: true };
}

/** File is uploaded to Storage client-side first; this just records the row (§5 attachments). */
export async function addAttachment(raw: unknown): Promise<ActionResult> {
  const parsed = attachmentSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const profile = await getProfile();
  if (!profile) return { ok: false, error: "Please sign in" };
  const supabase = await createClient();

  const { error } = await supabase.from("attachments").insert({
    shop_id: profile.shop_id,
    entity_type: parsed.data.entityType,
    entity_id: parsed.data.entityId,
    url: parsed.data.url,
    filename: parsed.data.filename || null,
    kind: parsed.data.kind,
    created_by: profile.id,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/jobs/${parsed.data.entityId}`);
  return { ok: true };
}
