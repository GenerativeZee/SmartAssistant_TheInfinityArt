/**
 * All "today" logic runs in Asia/Kolkata, on the server. Never compute today
 * from the browser clock.
 */
import { TZDate } from "@date-fns/tz";
import { format, differenceInCalendarDays, addDays, startOfMonth } from "date-fns";

export const IST = "Asia/Kolkata";

/** Coerce a Date / ISO string / epoch to a TZDate anchored to IST. */
function toIST(value: Date | string | number): TZDate {
  const d = value instanceof Date ? value : new Date(value);
  return new TZDate(d, IST);
}

/** Today as a YYYY-MM-DD string in IST — safe to compare against `date` columns. */
export function todayIST(): string {
  return format(toIST(new Date()), "yyyy-MM-dd");
}

/** A TZDate anchored to IST for the given instant (defaults to now). */
export function nowIST(instant: Date | string | number = new Date()): TZDate {
  return toIST(instant);
}

/** "04 Sep" — the only date format shown to the user. */
export function fmtDay(value: Date | string | null | undefined): string {
  if (!value) return "";
  return format(toIST(value), "dd MMM");
}

/** "04 Sep 2026" — when the year matters (receipts, PDFs). */
export function fmtDayYear(value: Date | string | null | undefined): string {
  if (!value) return "";
  return format(toIST(value), "dd MMM yyyy");
}

/** Whole calendar days between two dates, in IST. Positive when `to` is later. */
export function daysBetween(
  from: Date | string,
  to: Date | string = todayIST(),
): number {
  return differenceInCalendarDays(toIST(to), toIST(from));
}

/** Days a `date` string is overdue relative to today (negative = still future). */
export function daysOverdue(due: string, today: string = todayIST()): number {
  return daysBetween(due, today);
}

export function addDaysIST(value: string, n: number): string {
  return format(addDays(toIST(value), n), "yyyy-MM-dd");
}

export function firstOfMonthIST(today: string = todayIST()): string {
  return format(startOfMonth(toIST(today)), "yyyy-MM-dd");
}

/** Quick date-chip choices used by quick-add and follow-up pickers. */
export function chipDate(kind: "kal" | "2din" | "hafta", today: string = todayIST()): string {
  if (kind === "kal") return addDaysIST(today, 1);
  if (kind === "2din") return addDaysIST(today, 2);
  return addDaysIST(today, 7);
}
