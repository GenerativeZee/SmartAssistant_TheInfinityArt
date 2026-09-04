"use server";

import { revalidatePath } from "next/cache";
import { createClient, getProfile } from "@/lib/supabase/server";
import { S } from "@/lib/strings";
import { quickAddSchema, type WhatNext, type RequirementKey } from "@/lib/validation/clients";
import type { ActionResult } from "@/lib/actions/quotations";

const REQ_LABEL: Record<RequirementKey, string> = {
  signage: S.requirementChips.signage,
  print: S.requirementChips.print,
  wedding: S.requirementChips.wedding,
  branding: S.requirementChips.branding,
  web: S.requirementChips.web,
  mockup: S.requirementChips.mockup,
  other: S.requirementChips.other,
};

const FOLLOWUP_TITLE: Record<Exclude<WhatNext, "nothing">, string> = {
  call_back: "Call back",
  quotation: "Send quotation",
  demo: "Show demo",
};

export type QuickAddResult =
  | { ok: true; clientId: string; name: string; existed: boolean }
  | { ok: false; error: string };

/** On-blur lookup: does this phone already belong to a client? */
export async function findClientByPhone(
  phoneRaw: string,
): Promise<{ id: string; name: string; company: string | null } | null> {
  const digits = phoneRaw.replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .select("id, name, company")
    .eq("phone", digits)
    .maybeSingle();
  return data ?? null;
}

/** The 10-second capture. Creates/updates the client + a visit + optional follow-up + optional voice note. */
export async function quickAdd(raw: unknown): Promise<QuickAddResult> {
  const parsed = quickAddSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? S.common.error };
  }
  const input = parsed.data;

  const profile = await getProfile();
  if (!profile) return { ok: false, error: "Please sign in" };
  const supabase = await createClient();
  const shop_id = profile.shop_id;
  const now = new Date().toISOString();

  // 1. resolve the client — phone is identity, never create a duplicate
  let clientId = input.existingClientId ?? null;
  let existed = false;

  if (!clientId) {
    const { data: match } = await supabase
      .from("clients")
      .select("id")
      .eq("phone", input.phone)
      .maybeSingle();
    if (match) clientId = match.id;
  }

  if (clientId) {
    existed = true;
    const patch: Record<string, unknown> = { last_contacted_at: now };
    // only fill a blank name; never clobber an existing one
    const { data: cur } = await supabase
      .from("clients")
      .select("name")
      .eq("id", clientId)
      .single();
    if (cur && (!cur.name || cur.name.trim() === "")) patch.name = input.name;
    const { error } = await supabase.from("clients").update(patch).eq("id", clientId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data: created, error } = await supabase
      .from("clients")
      .insert({
        shop_id,
        name: input.name,
        phone: input.phone,
        source: "walk_in",
        last_contacted_at: now,
        created_by: profile.id,
      })
      .select("id")
      .single();
    if (error || !created) return { ok: false, error: error?.message ?? S.common.error };
    clientId = created.id as string;
  }

  if (!clientId) return { ok: false, error: S.common.error };

  // 2. log the visit
  const reqLabels = input.requirements.map((r) => REQ_LABEL[r]);
  const summary =
    reqLabels.length > 0 ? `Interested in: ${reqLabels.join(", ")}` : "Client visit logged";
  const { error: iErr } = await supabase.from("interactions").insert({
    shop_id,
    client_id: clientId,
    type: "visit",
    summary,
    requirement_tags: input.requirements,
    occurred_at: now,
    created_by: profile.id,
  });
  if (iErr) return { ok: false, error: iErr.message };

  // 3. voice note (uploaded client-side already)
  if (input.voiceUrl) {
    await supabase.from("interactions").insert({
      shop_id,
      client_id: clientId,
      type: "voice",
      summary: "Voice note",
      voice_url: input.voiceUrl,
      occurred_at: now,
      created_by: profile.id,
    });
  }

  // 4. follow-up if he chose one
  if (input.whatNext !== "nothing" && input.followUpDate) {
    await supabase.from("follow_ups").insert({
      shop_id,
      client_id: clientId,
      related_type: "client",
      related_id: clientId,
      title: FOLLOWUP_TITLE[input.whatNext],
      context: reqLabels.join(", ") || null,
      due_date: input.followUpDate,
      status: "open",
      created_by: profile.id,
    });
  }

  revalidatePath("/clients");
  revalidatePath("/aaj");
  revalidatePath(`/clients/${clientId}`);
  return { ok: true, clientId, name: input.name, existed };
}

/**
 * Permanently deletes a client. Their interactions and follow-ups go with
 * them (cascade); quotations, jobs and payments are protected at the
 * database level (ON DELETE RESTRICT) — a client with real business history
 * can't be casually deleted, so we check first and give a clear reason
 * rather than surfacing a raw foreign-key error.
 */
export async function deleteClient(id: string): Promise<ActionResult> {
  const profile = await getProfile();
  if (!profile) return { ok: false, error: "Please sign in" };
  const supabase = await createClient();

  const [{ count: quotationCount }, { count: jobCount }, { count: paymentCount }] = await Promise.all([
    supabase.from("quotations").select("id", { count: "exact", head: true }).eq("client_id", id),
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("client_id", id),
    supabase.from("payments").select("id", { count: "exact", head: true }).eq("client_id", id),
  ]);

  const blockers: string[] = [];
  if (quotationCount) blockers.push(`${quotationCount} quotation${quotationCount === 1 ? "" : "s"}`);
  if (jobCount) blockers.push(`${jobCount} job${jobCount === 1 ? "" : "s"}`);
  if (paymentCount) blockers.push(`${paymentCount} payment${paymentCount === 1 ? "" : "s"}`);
  if (blockers.length > 0) {
    return { ok: false, error: `Can't delete — this client has ${blockers.join(", ")}.` };
  }

  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/clients");
  revalidatePath("/aaj");
  return { ok: true };
}
