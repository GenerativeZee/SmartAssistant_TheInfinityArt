/**
 * Receivables ageing buckets (§6.6, D4).
 *
 *   bucket 0  -> 0–15 din   (days 0..15)
 *   bucket 1  -> 16–30 din  (days 16..30)
 *   bucket 2  -> 30+ din    (days 31 and over)   -- labelled "30+ din"
 *
 * Aaj Ka Kaam additionally hides anything under 7 days (D5); the Paisa tab does
 * not. `null` days_outstanding = job not delivered yet -> "Delivery baaki".
 */
import { S } from "./strings";

export type AgeingBucket = 0 | 1 | 2;
export const AAJ_MIN_DAYS = 7;

export function ageingBucket(daysOutstanding: number): AgeingBucket {
  if (daysOutstanding <= 15) return 0;
  if (daysOutstanding <= 30) return 1;
  return 2;
}

export function ageingLabel(daysOutstanding: number | null | undefined): string {
  if (daysOutstanding === null || daysOutstanding === undefined) {
    return S.paisa.ageingPending;
  }
  return [S.paisa.ageing0, S.paisa.ageing1, S.paisa.ageing2][ageingBucket(daysOutstanding)];
}

/** Tailwind token for the chip — magenta once it is genuinely overdue money. */
export function ageingTone(daysOutstanding: number | null | undefined): "risk" | "owed" | "faint" {
  if (daysOutstanding === null || daysOutstanding === undefined) return "faint";
  if (daysOutstanding <= 15) return "risk";
  return "owed";
}

/** Whether a receivable is old enough to show on Aaj Ka Kaam. */
export function showsOnAaj(daysOutstanding: number | null | undefined): boolean {
  return daysOutstanding !== null && daysOutstanding !== undefined && daysOutstanding >= AAJ_MIN_DAYS;
}
