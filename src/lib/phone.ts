/**
 * Phone is the client's identity (§5). Indian mobile numbers: 10 digits,
 * first digit 6-9. We store the bare 10-digit form and prefix 91 only for
 * wa.me / tel: links.
 */

/** Strip everything but digits, drop a leading 91 / 0. */
export function normalizePhone(input: string): string {
  let d = (input ?? "").replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return d.slice(0, 10);
}

export function isValidPhone(input: string): boolean {
  return /^[6-9]\d{9}$/.test(normalizePhone(input));
}

/** "98765 43210" for display. */
export function formatPhone(input: string | null | undefined): string {
  const d = normalizePhone(input ?? "");
  if (d.length !== 10) return input ?? "";
  return `${d.slice(0, 5)} ${d.slice(5)}`;
}

export function telHref(input: string | null | undefined): string {
  const d = normalizePhone(input ?? "");
  return d.length === 10 ? `tel:+91${d}` : `tel:${input ?? ""}`;
}
