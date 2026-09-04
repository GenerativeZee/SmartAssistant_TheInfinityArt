"use server";

import { revalidatePath } from "next/cache";
import { createClient, getProfile } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/quotations";
import { serviceInputSchema } from "@/lib/validation/services";

/** Create or update one rate-card line (Settings -> Rate card, folded into M6). */
export async function upsertService(raw: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = serviceInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const input = parsed.data;

  const profile = await getProfile();
  if (!profile) return { ok: false, error: "Please sign in" };
  const supabase = await createClient();

  const row = {
    name: input.name,
    category: input.category,
    unit: input.unit,
    default_rate: input.defaultRate,
    gst_rate: input.gstRate,
    hsn_sac: input.hsnSac || null,
    active: input.active,
  };

  if (input.id) {
    const { error } = await supabase.from("services").update(row).eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/settings/rate-card");
    return { ok: true, id: input.id };
  }

  const { data, error } = await supabase
    .from("services")
    .insert({ ...row, shop_id: profile.shop_id })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "Could not add the service" };

  revalidatePath("/settings/rate-card");
  return { ok: true, id: data.id };
}

export async function setServiceActive(id: string, active: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("services").update({ active }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/settings/rate-card");
  return { ok: true };
}
