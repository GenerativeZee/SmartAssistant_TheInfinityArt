/**
 * WhatsApp message templates + deep-link builder (§7).
 *
 * Phase 1 is deep-links only: build a wa.me URL, open it, Shahid presses send in
 * his own WhatsApp. A deep link cannot attach a file, so anything with a PDF
 * puts a public Storage URL in the text (see lib/share-pdf.ts, added in M3).
 *
 * Templates live here — never inline in components — because Shahid will want to
 * reword them, and every message opens in an editable preview before it is sent.
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

export const templates = {
  hello: (c: MsgCtx) => `${c.name} ${c.greeting}, ${c.shopName} se baat kar raha hoon.`,

  quotation: (
    c: MsgCtx & { requirement: string; total: number; link: string },
  ) =>
    `${c.name} ${c.greeting}, aapke ${c.requirement} ki quotation bhej raha hoon — total ${formatMoney(
      c.total,
    )}. PDF yahan hai: ${c.link}. Koi change chahiye to bata dijiyega. — ${c.shopName}`,

  paymentReminder: (
    c: MsgCtx & { jobTitle: string; deliveredOn: string; balance: number; upiId: string; link: string },
  ) =>
    `${c.name} ${c.greeting}, ${c.jobTitle} ka kaam ${fmtDay(
      c.deliveredOn,
    )} ko complete ho gaya tha. ${formatMoney(
      c.balance,
    )} baaki hai — jab convenient ho bhej dijiyega. UPI: ${c.upiId}. Invoice: ${c.link}`,

  delivery: (c: MsgCtx & { reviewLink: string }) =>
    `${c.name} ${c.greeting}, aapka kaam ready hai. Shukriya! Agar sab theek laga ho to ek review zaroor dijiyega: ${c.reviewLink}`,

  receipt: (c: MsgCtx & { amount: number; balance: number; link: string }) =>
    `${formatMoney(c.amount)} receive ho gaya, shukriya. Receipt: ${c.link}. Ab baaki ${formatMoney(
      c.balance,
    )}.`,
};
