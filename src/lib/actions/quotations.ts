"use server";

import { revalidatePath } from "next/cache";
import { createClient, getProfile } from "@/lib/supabase/server";
import { computeQuoteTotals, computeLine, type SqftRounding } from "@/lib/pricing";
import { addDaysIST, todayIST } from "@/lib/dates";
import { quotationInputSchema, lostSchema } from "@/lib/validation/quotations";

export type ActionResult<T extends object = object> =
  | ({ ok: true } & T)
  | { ok: false; error: string };

/** Create a draft quotation with its line items, in one shop-scoped write. */
export async function createQuotation(raw: unknown): Promise<ActionResult<{ id: string; number: string }>> {
  const parsed = quotationInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const input = parsed.data;

  const profile = await getProfile();
  if (!profile) return { ok: false, error: "Please sign in" };
  const supabase = await createClient();
  const shop_id = profile.shop_id;

  const { data: shop } = await supabase
    .from("shops")
    .select("sqft_rounding, quotation_terms")
    .eq("id", shop_id)
    .single();
  const rounding = (shop?.sqft_rounding ?? "up_to_whole") as SqftRounding;

  const totals = computeQuoteTotals(
    {
      lines: input.items.map((i) => ({
        unit: i.unit,
        qty: i.qty,
        widthFt: i.widthFt,
        heightFt: i.heightFt,
        rate: i.rate,
        gstRate: i.gstRate,
      })),
      discount: input.discount,
    },
    rounding,
  );

  const { data: numberRow, error: numErr } = await supabase.rpc("next_document_number", {
    p_shop_id: shop_id,
    p_doc_type: "quotation",
  });
  if (numErr || !numberRow) return { ok: false, error: numErr?.message ?? "Could not assign a number" };
  const number = numberRow as string;

  const { data: quotation, error: qErr } = await supabase
    .from("quotations")
    .insert({
      shop_id,
      client_id: input.clientId,
      number,
      quote_date: todayIST(),
      valid_until: input.validUntil ?? addDaysIST(todayIST(), 15),
      status: "draft",
      subtotal: totals.subtotal,
      discount: totals.discount,
      taxable_amount: totals.taxableAmount,
      gst_amount: totals.gstAmount,
      total: totals.total,
      notes: input.notes || null,
      terms: input.terms ?? shop?.quotation_terms ?? null,
      created_by: profile.id,
    })
    .select("id")
    .single();
  if (qErr || !quotation) return { ok: false, error: qErr?.message ?? "Could not create quotation" };

  const itemsPayload = input.items.map((line, i) => ({
    quotation_id: quotation.id,
    service_id: line.serviceId ?? null,
    description: line.description,
    unit: line.unit,
    qty: line.qty,
    width_ft: line.unit === "sqft" ? line.widthFt : null,
    height_ft: line.unit === "sqft" ? line.heightFt : null,
    rate: line.rate,
    gst_rate: line.gstRate,
    amount: 0, // recomputed below with the exact rounding rule
    sort_order: i,
  }));

  // per-line amounts, computed the same way as the totals above so they always agree
  itemsPayload.forEach((row, i) => {
    const line = input.items[i];
    row.amount = computeLine(
      { unit: line.unit, qty: line.qty, widthFt: line.widthFt, heightFt: line.heightFt, rate: line.rate, gstRate: line.gstRate },
      rounding,
    ).amount;
  });

  const { error: itemsErr } = await supabase.from("quotation_items").insert(itemsPayload);
  if (itemsErr) {
    await supabase.from("quotations").delete().eq("id", quotation.id); // don't leave an orphan
    return { ok: false, error: itemsErr.message };
  }

  revalidatePath("/quotations");
  revalidatePath(`/clients/${input.clientId}`);
  return { ok: true, id: quotation.id, number };
}

/** Replace an existing draft's items and recompute totals. */
export async function updateQuotation(id: string, raw: unknown): Promise<ActionResult> {
  const parsed = quotationInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const input = parsed.data;

  const profile = await getProfile();
  if (!profile) return { ok: false, error: "Please sign in" };
  const supabase = await createClient();

  const { data: shop } = await supabase
    .from("shops")
    .select("sqft_rounding")
    .eq("id", profile.shop_id)
    .single();
  const rounding = (shop?.sqft_rounding ?? "up_to_whole") as SqftRounding;

  const totals = computeQuoteTotals(
    { lines: input.items, discount: input.discount },
    rounding,
  );

  const { error: qErr } = await supabase
    .from("quotations")
    .update({
      client_id: input.clientId,
      valid_until: input.validUntil ?? undefined,
      subtotal: totals.subtotal,
      discount: totals.discount,
      taxable_amount: totals.taxableAmount,
      gst_amount: totals.gstAmount,
      total: totals.total,
      notes: input.notes || null,
      terms: input.terms || null,
    })
    .eq("id", id);
  if (qErr) return { ok: false, error: qErr.message };

  const { error: delErr } = await supabase.from("quotation_items").delete().eq("quotation_id", id);
  if (delErr) return { ok: false, error: delErr.message };

  const itemsPayload = input.items.map((line, i) => ({
    quotation_id: id,
    service_id: line.serviceId ?? null,
    description: line.description,
    unit: line.unit,
    qty: line.qty,
    width_ft: line.unit === "sqft" ? line.widthFt : null,
    height_ft: line.unit === "sqft" ? line.heightFt : null,
    rate: line.rate,
    gst_rate: line.gstRate,
    amount: computeLine(line, rounding).amount,
    sort_order: i,
  }));
  const { error: itemsErr } = await supabase.from("quotation_items").insert(itemsPayload);
  if (itemsErr) return { ok: false, error: itemsErr.message };

  revalidatePath("/quotations");
  revalidatePath(`/quotations/${id}`);
  return { ok: true };
}

/** Persist the generated PDF's public URL onto the quotation. */
export async function setQuotationPdfUrl(id: string, url: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("quotations").update({ pdf_url: url }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Mark sent — the M1 trigger stamps sent_at and schedules the +3 day follow-up. */
export async function markQuotationSent(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("quotations").update({ status: "sent" }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/quotations");
  revalidatePath(`/quotations/${id}`);
  return { ok: true };
}

export async function markQuotationLost(raw: unknown): Promise<ActionResult> {
  const parsed = lostSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid input" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("quotations")
    .update({
      status: "lost",
      lost_reason: parsed.data.reason,
      lost_note: parsed.data.note || null,
      decided_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/quotations");
  revalidatePath(`/quotations/${parsed.data.id}`);
  return { ok: true };
}
