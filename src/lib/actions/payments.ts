"use server";

import { revalidatePath } from "next/cache";
import { createClient, getProfile } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/quotations";
import { recordPaymentSchema } from "@/lib/validation/payments";

/**
 * Record a payment (§8.6). Infers `kind` since the sheet only asks for
 * amount / mode / job / date, same as spec: no job -> advance; a job's
 * first payment -> advance; a payment that clears the remaining balance ->
 * final; anything else -> part. Assigns the receipt number via the M1
 * next_document_number() RPC — never generated in app code.
 */
export async function recordPayment(
  raw: unknown,
): Promise<ActionResult<{ paymentId: string; receiptNumber: string }>> {
  const parsed = recordPaymentSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const input = parsed.data;

  const profile = await getProfile();
  if (!profile) return { ok: false, error: "Please sign in" };
  const supabase = await createClient();
  const shop_id = profile.shop_id;

  let kind: "advance" | "part" | "final" = "advance";
  if (input.jobId) {
    const [{ data: financials }, { count }] = await Promise.all([
      supabase.from("job_financials").select("balance").eq("job_id", input.jobId).maybeSingle(),
      supabase
        .from("payments")
        .select("id", { count: "exact", head: true })
        .eq("job_id", input.jobId),
    ]);
    const balance = Number(financials?.balance ?? 0);
    if (input.amount >= balance) kind = "final";
    else if ((count ?? 0) === 0) kind = "advance";
    else kind = "part";
  }

  const { data: receiptNumber, error: numErr } = await supabase.rpc("next_document_number", {
    p_shop_id: shop_id,
    p_doc_type: "receipt",
  });
  if (numErr || !receiptNumber) return { ok: false, error: numErr?.message ?? "Could not assign a receipt number" };

  const { data: payment, error } = await supabase
    .from("payments")
    .insert({
      shop_id,
      client_id: input.clientId,
      job_id: input.jobId || null,
      kind,
      amount: input.amount,
      mode: input.mode,
      received_at: input.receivedAt,
      receipt_number: receiptNumber,
      note: input.note || null,
      created_by: profile.id,
    })
    .select("id")
    .single();
  if (error || !payment) return { ok: false, error: error?.message ?? "Could not record the payment" };

  revalidatePath("/paisa");
  revalidatePath(`/clients/${input.clientId}`);
  if (input.jobId) revalidatePath(`/jobs/${input.jobId}`);

  return { ok: true, paymentId: payment.id, receiptNumber: receiptNumber as string };
}

export async function setPaymentPdfUrl(id: string, url: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("payments").update({ pdf_url: url }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Client picker step of the payment sheet — name/phone search. */
export async function searchClientsBrief(
  query: string,
): Promise<{ id: string; name: string; company: string | null; phone: string | null }[]> {
  const q = query.trim();
  if (!q) return [];
  const supabase = await createClient();
  const digits = q.replace(/\D/g, "");
  const term = digits.length >= 3 ? digits : q;
  const { data } = await supabase
    .from("clients")
    .select("id, name, company, phone")
    .or(`name.ilike.%${term}%,phone.ilike.%${term}%,company.ilike.%${term}%`)
    .order("last_contacted_at", { ascending: false, nullsFirst: false })
    .limit(15);
  return data ?? [];
}

/** Job picker step — this client's non-cancelled jobs, balance-owing ones first. */
export async function getClientJobsForPayment(
  clientId: string,
): Promise<{ id: string; number: string | null; title: string; balance: number }[]> {
  const supabase = await createClient();
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, number, title")
    .eq("client_id", clientId)
    .neq("stage", "cancelled")
    .order("created_at", { ascending: false });
  if (!jobs || jobs.length === 0) return [];

  const { data: financials } = await supabase
    .from("job_financials")
    .select("job_id, balance")
    .in(
      "job_id",
      jobs.map((j) => j.id),
    );
  const balanceByJob = new Map((financials ?? []).map((f) => [f.job_id, Number(f.balance)]));

  return jobs
    .map((j) => ({ ...j, balance: balanceByJob.get(j.id) ?? 0 }))
    .sort((a, b) => b.balance - a.balance);
}
