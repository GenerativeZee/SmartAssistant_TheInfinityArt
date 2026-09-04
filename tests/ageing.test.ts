import { describe, it, expect } from "vitest";
import { ageingBucket, ageingLabel, showsOnAaj, AAJ_MIN_DAYS } from "@/lib/ageing";

describe("ageing bucket boundaries (§6.6, D4)", () => {
  it("days 0..15 are bucket 0", () => {
    expect(ageingBucket(0)).toBe(0);
    expect(ageingBucket(7)).toBe(0);
    expect(ageingBucket(15)).toBe(0);
  });

  it("days 16..30 are bucket 1", () => {
    expect(ageingBucket(16)).toBe(1);
    expect(ageingBucket(30)).toBe(1);
  });

  it("day 31 and over are bucket 2", () => {
    expect(ageingBucket(31)).toBe(2);
    expect(ageingBucket(365)).toBe(2);
  });

  it('labels: the third bucket reads "30+ days" (D15: English UI)', () => {
    expect(ageingLabel(10)).toBe("0–15 days");
    expect(ageingLabel(20)).toBe("16–30 days");
    expect(ageingLabel(45)).toBe("30+ days");
    expect(ageingLabel(null)).toBe("Not yet delivered");
  });
});

describe("Aaj Ka Kaam 7-day floor (D5)", () => {
  it("hides receivables younger than 7 days, shows the rest", () => {
    expect(AAJ_MIN_DAYS).toBe(7);
    expect(showsOnAaj(6)).toBe(false);
    expect(showsOnAaj(7)).toBe(true);
    expect(showsOnAaj(40)).toBe(true);
    expect(showsOnAaj(null)).toBe(false); // undelivered never ages
  });
});
