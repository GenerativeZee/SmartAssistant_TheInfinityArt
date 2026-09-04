/**
 * Quotation / invoice pricing. All money maths lives here so it can be unit
 * tested against the §12 acceptance numbers.
 *
 *   12 × 4 ft flex @ ₹15/sq.ft  -> line ₹720
 *   + 18% GST                   -> grand total ₹849.60
 */
import { round2, roundUpWhole } from "./money";

export type Unit = "sqft" | "piece" | "box" | "job" | "hour";
export type SqftRounding = "none" | "up_to_whole";

export interface LineInput {
  unit: Unit;
  qty: number;
  widthFt?: number | null;
  heightFt?: number | null;
  rate: number;
  gstRate: number;
}

export interface LineComputed {
  /** width × height, after the shop's rounding rule (sqft units only) */
  area: number | null;
  /** the printed "12 × 4 ft = 48 sq.ft" readout, or null for non-sqft lines */
  areaLabel: string | null;
  amount: number;
}

/** Area for a sq.ft line, applying the shop rounding rule (§6.2). */
export function computeArea(
  widthFt: number | null | undefined,
  heightFt: number | null | undefined,
  rounding: SqftRounding,
): number {
  const raw = (widthFt ?? 0) * (heightFt ?? 0);
  if (raw <= 0) return 0;
  return rounding === "up_to_whole" ? roundUpWhole(raw) : round2(raw);
}

/** One quotation line: area (if sqft), the live readout, and the line amount. */
export function computeLine(line: LineInput, rounding: SqftRounding): LineComputed {
  if (line.unit === "sqft") {
    const area = computeArea(line.widthFt, line.heightFt, rounding);
    const amount = round2(area * line.qty * line.rate);
    const areaLabel =
      line.widthFt && line.heightFt
        ? `${trimNum(line.widthFt)} × ${trimNum(line.heightFt)} ft = ${trimNum(area)} sq.ft`
        : null;
    return { area, areaLabel, amount };
  }
  return { area: null, areaLabel: null, amount: round2(line.qty * line.rate) };
}

export interface QuoteInput {
  lines: LineInput[];
  /** absolute discount amount on the subtotal, distributed across lines */
  discount?: number;
}

export interface QuoteTotals {
  subtotal: number;
  discount: number;
  taxableAmount: number;
  gstAmount: number;
  total: number;
  /** intra-state split for the PDF (§6.3, D10) */
  cgst: number;
  sgst: number;
}

/**
 * Roll lines up to a quotation total. A header discount is spread across lines
 * in proportion to their amount so GST stays correct even with mixed rates.
 * TODO(IGST): for inter-state supply, replace the CGST/SGST split with a single
 * IGST line at the full rate.
 */
export function computeQuoteTotals(input: QuoteInput, rounding: SqftRounding): QuoteTotals {
  const amounts = input.lines.map((l) => computeLine(l, rounding).amount);
  const subtotal = round2(amounts.reduce((a, b) => a + b, 0));
  const discount = round2(Math.min(Math.max(input.discount ?? 0, 0), subtotal));

  let gstAmount = 0;
  input.lines.forEach((line, i) => {
    const share = subtotal > 0 ? amounts[i] / subtotal : 0;
    const taxableLine = amounts[i] - discount * share;
    gstAmount += taxableLine * (line.gstRate / 100);
  });
  gstAmount = round2(gstAmount);

  const taxableAmount = round2(subtotal - discount);
  const total = round2(taxableAmount + gstAmount);
  const cgst = round2(gstAmount / 2);
  const sgst = round2(gstAmount - cgst);

  return { subtotal, discount, taxableAmount, gstAmount, total, cgst, sgst };
}

function trimNum(n: number): string {
  return Number.isInteger(n) ? String(n) : String(round2(n));
}
