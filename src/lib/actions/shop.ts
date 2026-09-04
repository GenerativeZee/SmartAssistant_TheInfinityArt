"use server";

import { revalidatePath } from "next/cache";
import { createClient, getProfile } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/quotations";
import { shopProfileSchema, templatesInputSchema } from "@/lib/validation/shop";

export async function updateShopProfile(raw: unknown): Promise<ActionResult> {
  const parsed = shopProfileSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const input = parsed.data;

  const profile = await getProfile();
  if (!profile) return { ok: false, error: "Please sign in" };
  const supabase = await createClient();

  const { error } = await supabase
    .from("shops")
    .update({
      name: input.name,
      legal_name: input.legalName || null,
      address: input.address || null,
      city: input.city || null,
      state: input.state || null,
      pincode: input.pincode || null,
      phone: input.phone || null,
      whatsapp_number: input.whatsappNumber || null,
      email: input.email || null,
      gstin: input.gstin || null,
      upi_id: input.upiId || null,
      default_gst_rate: input.defaultGstRate,
      sqft_rounding: input.sqftRounding,
      default_greeting: input.defaultGreeting,
      quotation_terms: input.quotationTerms || null,
    })
    .eq("id", profile.shop_id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/settings");
  revalidatePath("/settings/profile");
  return { ok: true };
}

export async function setShopLogoUrl(url: string): Promise<ActionResult> {
  const profile = await getProfile();
  if (!profile) return { ok: false, error: "Please sign in" };
  const supabase = await createClient();
  const { error } = await supabase.from("shops").update({ logo_url: url }).eq("id", profile.shop_id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/settings");
  revalidatePath("/settings/profile");
  return { ok: true };
}

export async function setShopUpiQrUrl(url: string): Promise<ActionResult> {
  const profile = await getProfile();
  if (!profile) return { ok: false, error: "Please sign in" };
  const supabase = await createClient();
  const { error } = await supabase.from("shops").update({ upi_qr_url: url }).eq("id", profile.shop_id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/settings");
  revalidatePath("/settings/profile");
  return { ok: true };
}

/** Saves the four editable WhatsApp templates (§8.7). An empty string clears an override back to the default. */
export async function updateMessageTemplates(raw: unknown): Promise<ActionResult> {
  const parsed = templatesInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const profile = await getProfile();
  if (!profile) return { ok: false, error: "Please sign in" };
  const supabase = await createClient();

  // drop empty strings so they fall back to the built-in default, not an empty message
  const cleaned = Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v.trim() !== ""));

  const { error } = await supabase
    .from("shops")
    .update({ message_templates: cleaned })
    .eq("id", profile.shop_id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/settings/templates");
  return { ok: true };
}
