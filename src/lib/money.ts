/**
 * Money helpers. Values are stored as numeric(12,2) in Postgres and arrive as
 * strings or numbers — always normalise through here. Never do math on the
 * display string.
 */

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const inrPlain = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** "₹1,42,500" — Indian digit grouping. Trailing .00 is dropped. */
export function formatMoney(value: number | string | null | undefined): string {
  return inr.format(toPaiseSafeNumber(value));
}

/** "1,42,500" without the symbol — for tight table cells. */
export function formatAmount(value: number | string | null | undefined): string {
  return inrPlain.format(toPaiseSafeNumber(value));
}

/** Parse a user-typed amount ("1,42,500" / "1.42.500" / " 500 ") to a number. */
export function parseAmount(input: string): number {
  const cleaned = input.replace(/[^\d.]/g, "");
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? round2(n) : 0;
}

/**
 * Round to 2 dp the way currency should. `toFixed` does correct decimal
 * rounding and hands back a canonical value (no `18.009999999999998` dust).
 */
export function round2(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Number((n + (n >= 0 ? 1e-9 : -1e-9)).toFixed(2));
}

/** Round up to the next whole unit — used for sq.ft area rounding (§6.2). */
export function roundUpWhole(n: number): number {
  return Math.ceil(n - 1e-9);
}

function toPaiseSafeNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  const n = typeof value === "string" ? Number.parseFloat(value) : value;
  return Number.isFinite(n) ? n : 0;
}
