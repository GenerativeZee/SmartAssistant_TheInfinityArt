/**
 * WhatsApp message templates + deep-link builder (§7).
 *
 * Phase 1 is deep-links only: build a wa.me URL, open it, Shahid presses send in
 * his own WhatsApp. A deep link cannot attach a file, so anything with a PDF
 * puts a public Storage URL in the text (see lib/share-pdf.ts, added in M3).
 *
 * Templates live here — never inline in components — because Shahid can reword
 * them from Settings → Message templates (M6+): each one below is the default,
 * overridden per-shop via `shops.message_templates` (a plain {key: string} jsonb
 * column — an empty/missing key just falls back to the default here). Every
 * message opens in an editable preview before it is sent, regardless.
 */
import { normalizePhone } from "./phone";
import { formatMoney } from "./money";
import { fmtDay } from "./dates";

/** https://wa.me/91XXXXXXXXXX?text=... — returns "" if the number is unusable. */
export function waLink(phone: string | null | undefined, text?: string): string {
  const d = normalizePhone(phone ?? "");
  if (d.length !== 10) return "";
  const base = `https://wa.me/91${d}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export interface MsgCtx {
  name: string;
  greeting: string; // shops.default_greeting, e.g. "ji"
  shopName: string;
}

/** Overrides stored on shops.message_templates, keyed the same as DEFAULT_TEMPLATES. */
export type MessageTemplateOverrides = Partial<Record<keyof typeof DEFAULT_TEMPLATES, string>>;

export const DEFAULT_TEMPLATES = {
  quotation:
    "{name} {greeting}, aapke {requirement} ki quotation bhej raha hoon — total {total}. PDF yahan hai: {link}. Koi change chahiye to bata dijiyega. — {shop_name}",
  paymentReminder:
    "{name} {greeting}, {job_title} ka kaam {delivered_date} ko complete ho gaya tha. {balance} baaki hai — jab convenient ho bhej dijiyega. UPI: {upi_id}. Invoice: {link}",
  delivery:
    "{name} {greeting}, aapka kaam ready hai. Shukriya! Agar sab theek laga ho to ek review zaroor dijiyega: {review_link}",
  receipt: "{amount} receive ho gaya, shukriya. Receipt: {link}. Ab baaki {balance}.",
} as const;

export const TEMPLATE_LABELS: Record<keyof typeof DEFAULT_TEMPLATES, string> = {
  quotation: "Quotation",
  paymentReminder: "Payment reminder",
  delivery: "Delivery",
  receipt: "Receipt",
};

/** The placeholders each template accepts, shown as a hint next to the editor. */
export const TEMPLATE_PLACEHOLDERS: Record<keyof typeof DEFAULT_TEMPLATES, string[]> = {
  quotation: ["name", "greeting", "shop_name", "requirement", "total", "link"],
  paymentReminder: ["name", "greeting", "job_title", "delivered_date", "balance", "upi_id", "link"],
  delivery: ["name", "greeting", "review_link"],
  receipt: ["amount", "link", "balance"],
};

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => vars[key] ?? match);
}

export const templates = {
  hello: (c: MsgCtx) => `${c.name} ${c.greeting}, ${c.shopName} se baat kar raha hoon.`,

  quotation: (
    c: MsgCtx & { requirement: string; total: number; link: string },
    override?: string,
  ) =>
    fill(override || DEFAULT_TEMPLATES.quotation, {
      name: c.name,
      greeting: c.greeting,
      shop_name: c.shopName,
      requirement: c.requirement,
      total: formatMoney(c.total),
      link: c.link,
    }),

  paymentReminder: (
    c: MsgCtx & { jobTitle: string; deliveredOn: string; balance: number; upiId: string; link: string },
    override?: string,
  ) =>
    fill(override || DEFAULT_TEMPLATES.paymentReminder, {
      name: c.name,
      greeting: c.greeting,
      job_title: c.jobTitle,
      delivered_date: fmtDay(c.deliveredOn),
      balance: formatMoney(c.balance),
      upi_id: c.upiId || "-",
      link: c.link,
    }),

  delivery: (c: MsgCtx & { reviewLink: string }, override?: string) =>
    fill(override || DEFAULT_TEMPLATES.delivery, {
      name: c.name,
      greeting: c.greeting,
      review_link: c.reviewLink,
    }),

  receipt: (c: MsgCtx & { amount: number; balance: number; link: string }, override?: string) =>
    fill(override || DEFAULT_TEMPLATES.receipt, {
      amount: formatMoney(c.amount),
      link: c.link,
      balance: formatMoney(c.balance),
    }),
};
