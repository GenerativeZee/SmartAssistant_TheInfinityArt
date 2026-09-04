/**
 * Hand-written domain types. Once the schema settles, regenerate the full set:
 *   npx supabase gen types typescript --local > src/lib/database.types.ts
 * and re-export the Row types from there.
 */

export type Role = "owner" | "staff";
export type ClientSource =
  | "walk_in"
  | "reference"
  | "instagram"
  | "google"
  | "whatsapp"
  | "repeat"
  | "other";
export type InteractionType = "visit" | "call" | "whatsapp" | "note" | "voice";
export type FollowUpStatus = "open" | "done" | "snoozed" | "dropped";
export type FollowUpRelated = "client" | "quotation" | "job" | "payment";
export type ServiceCategory = "signage" | "print" | "wedding" | "branding" | "web" | "other";
export type ServiceUnit = "sqft" | "piece" | "box" | "job" | "hour";
export type QuotationStatus = "draft" | "sent" | "followup" | "won" | "lost";
export type JobStage =
  | "design"
  | "approval"
  | "print"
  | "finishing"
  | "installation"
  | "delivered"
  | "cancelled";
export type PaymentKind = "advance" | "part" | "final";
export type PaymentMode = "cash" | "upi" | "bank" | "cheque";
export type DocType = "quotation" | "job" | "receipt";

export interface Profile {
  id: string;
  shop_id: string;
  name: string | null;
  phone: string | null;
  role: Role;
  email?: string | null;
}

export interface Shop {
  id: string;
  name: string;
  legal_name: string | null;
  logo_url: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  email: string | null;
  gstin: string | null;
  upi_id: string | null;
  upi_qr_url: string | null;
  doc_prefix: string;
  default_gst_rate: string;
  sqft_rounding: "none" | "up_to_whole";
  default_greeting: string;
  built_by_credit: string | null;
  quotation_terms: string | null;
}
