import { describe, it, expect } from "vitest";
import { computeArea, computeLine, computeQuoteTotals } from "@/lib/pricing";

describe("sq.ft area rounding (§6.2)", () => {
  it("rounds area up to the next whole sq.ft when the shop says so", () => {
    expect(computeArea(3.5, 2, "up_to_whole")).toBe(7); // 7.0 -> 7
    expect(computeArea(3.5, 2.1, "up_to_whole")).toBe(8); // 7.35 -> 8
    expect(computeArea(12, 4, "up_to_whole")).toBe(48); // already whole
  });

  it("keeps the exact area when rounding is off", () => {
    expect(computeArea(3.5, 2.1, "none")).toBeCloseTo(7.35, 2);
  });

  it("is zero when a dimension is missing", () => {
    expect(computeArea(null, 4, "up_to_whole")).toBe(0);
    expect(computeArea(10, undefined, "none")).toBe(0);
  });
});

describe("line amount", () => {
  it("12 x 4 ft flex @ ₹15/sq.ft is ₹720 (§12)", () => {
    const line = computeLine(
      { unit: "sqft", qty: 1, widthFt: 12, heightFt: 4, rate: 15, gstRate: 18 },
      "up_to_whole",
    );
    expect(line.area).toBe(48);
    expect(line.amount).toBe(720);
    expect(line.areaLabel).toBe("12 × 4 ft = 48 sq.ft");
  });

  it("multiplies by qty for sq.ft lines", () => {
    const line = computeLine(
      { unit: "sqft", qty: 3, widthFt: 2, heightFt: 2, rate: 50, gstRate: 18 },
      "up_to_whole",
    );
    expect(line.amount).toBe(600); // 4 sq.ft * 3 * 50
  });

  it("piece / box / job lines are just qty * rate", () => {
    expect(
      computeLine({ unit: "box", qty: 5, rate: 250, gstRate: 18 }, "up_to_whole").amount,
    ).toBe(1250);
    expect(
      computeLine({ unit: "job", qty: 1, rate: 5000, gstRate: 18 }, "up_to_whole").amount,
    ).toBe(5000);
  });
});

describe("quotation totals + GST (§6.3, §12)", () => {
  it("₹720 line + 18% GST => grand total ₹849.60", () => {
    const t = computeQuoteTotals(
      { lines: [{ unit: "sqft", qty: 1, widthFt: 12, heightFt: 4, rate: 15, gstRate: 18 }] },
      "up_to_whole",
    );
    expect(t.subtotal).toBe(720);
    expect(t.taxableAmount).toBe(720);
    expect(t.gstAmount).toBe(129.6);
    expect(t.total).toBe(849.6);
    expect(t.cgst).toBe(64.8);
    expect(t.sgst).toBe(64.8);
    expect(t.cgst + t.sgst).toBe(t.gstAmount);
  });

  it("splits odd-paise GST so cgst + sgst always re-sums (D10)", () => {
    const t = computeQuoteTotals(
      { lines: [{ unit: "job", qty: 1, rate: 100.05, gstRate: 18 }] },
      "none",
    );
    expect(t.gstAmount).toBe(18.01); // 18.009 -> 18.01
    expect(t.cgst + t.sgst).toBeCloseTo(t.gstAmount, 2); // no lost paisa when rendered
    expect(Math.abs(t.cgst - t.sgst)).toBeLessThanOrEqual(0.01); // halves within a paisa
  });

  it("distributes a header discount across mixed GST rates", () => {
    const t = computeQuoteTotals(
      {
        lines: [
          { unit: "job", qty: 1, rate: 1000, gstRate: 18 },
          { unit: "job", qty: 1, rate: 1000, gstRate: 5 },
        ],
        discount: 200,
      },
      "none",
    );
    expect(t.subtotal).toBe(2000);
    expect(t.taxableAmount).toBe(1800);
    // 900 @18% + 900 @5% = 162 + 45 = 207
    expect(t.gstAmount).toBe(207);
    expect(t.total).toBe(2007);
  });

  it("never lets the discount exceed the subtotal", () => {
    const t = computeQuoteTotals(
      { lines: [{ unit: "job", qty: 1, rate: 500, gstRate: 18 }], discount: 9999 },
      "none",
    );
    expect(t.discount).toBe(500);
    expect(t.taxableAmount).toBe(0);
    expect(t.total).toBe(0);
  });
});
