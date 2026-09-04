import { describe, it, expect } from "vitest";
import { formatMoney, formatAmount, parseAmount, round2, roundUpWhole } from "@/lib/money";

describe("Indian money formatting (§3)", () => {
  it("groups with lakh/crore separators", () => {
    expect(formatMoney(142500)).toBe("₹1,42,500");
    expect(formatMoney(849.6)).toBe("₹849.6");
    expect(formatMoney(10000000)).toBe("₹1,00,00,000");
    expect(formatAmount(142500)).toBe("1,42,500");
  });

  it("treats null / empty / junk as zero", () => {
    expect(formatMoney(null)).toBe("₹0");
    expect(formatMoney(undefined)).toBe("₹0");
    expect(formatMoney("")).toBe("₹0");
  });

  it("accepts numeric strings from Postgres", () => {
    expect(formatMoney("14396.00")).toBe("₹14,396");
  });
});

describe("parseAmount", () => {
  it("strips grouping and symbols", () => {
    expect(parseAmount("₹1,42,500")).toBe(142500);
    expect(parseAmount(" 500 ")).toBe(500);
    expect(parseAmount("abc")).toBe(0);
    expect(parseAmount("1234.5")).toBe(1234.5);
  });
});

describe("rounding helpers", () => {
  it("round2 rounds half away from zero", () => {
    expect(round2(1.005)).toBe(1.01);
    expect(round2(720)).toBe(720);
  });
  it("roundUpWhole ignores float dust", () => {
    expect(roundUpWhole(7)).toBe(7);
    expect(roundUpWhole(7.0000000001)).toBe(7);
    expect(roundUpWhole(7.35)).toBe(8);
  });
});
