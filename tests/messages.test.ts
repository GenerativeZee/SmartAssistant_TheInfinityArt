import { describe, it, expect } from "vitest";
import { templates, waLink, DEFAULT_TEMPLATES } from "@/lib/messages";

const ctx = { name: "Ayesha Traders", greeting: "ji", shopName: "The Infinity Art" };

describe("message templates — default text (§7)", () => {
  it("quotation", () => {
    const msg = templates.quotation({ ...ctx, requirement: "board", total: 1557.6, link: "https://x/q.pdf" });
    expect(msg).toContain("Ayesha Traders ji");
    expect(msg).toContain("₹1,557.6");
    expect(msg).toContain("https://x/q.pdf");
  });

  it("receipt", () => {
    const msg = templates.receipt({ ...ctx, amount: 5000, balance: 0, link: "https://x/r.pdf" });
    expect(msg).toContain("₹5,000");
    expect(msg).toContain("https://x/r.pdf");
  });
});

describe("message templates — shop overrides (Settings → Message templates)", () => {
  it("uses the override verbatim, substituting the same placeholders", () => {
    const override = "Hi {name}! Total: {total}. Here: {link}";
    const msg = templates.quotation(
      { ...ctx, requirement: "board", total: 500, link: "https://x/q.pdf" },
      override,
    );
    expect(msg).toBe("Hi Ayesha Traders! Total: ₹500. Here: https://x/q.pdf");
  });

  it("falls back to the default when no override is stored", () => {
    const withUndefined = templates.receipt({ ...ctx, amount: 100, balance: 0, link: "L" }, undefined);
    const withoutArg = templates.receipt({ ...ctx, amount: 100, balance: 0, link: "L" });
    expect(withUndefined).toBe(withoutArg);
  });

  it("falls back to the default when the override is an empty string", () => {
    const msg = templates.receipt({ ...ctx, amount: 100, balance: 0, link: "L" }, "");
    expect(msg).toBe(templates.receipt({ ...ctx, amount: 100, balance: 0, link: "L" }));
  });

  it("leaves an unknown placeholder untouched rather than dropping it silently", () => {
    const msg = templates.receipt({ ...ctx, amount: 100, balance: 0, link: "L" }, "Amount: {amount}, oops {nope}");
    expect(msg).toBe("Amount: ₹100, oops {nope}");
  });

  it("every default template is valid — no stray unmatched braces", () => {
    for (const tpl of Object.values(DEFAULT_TEMPLATES)) {
      expect(tpl).toMatch(/\{(\w+)\}/); // has at least one placeholder
      expect((tpl.match(/\{/g) ?? []).length).toBe((tpl.match(/\}/g) ?? []).length);
    }
  });
});

describe("waLink", () => {
  it("builds a wa.me link with the 91 country code and encoded text", () => {
    expect(waLink("9876543210", "hi there")).toBe("https://wa.me/919876543210?text=hi%20there");
  });
  it("returns empty for an unusable number", () => {
    expect(waLink(null)).toBe("");
    expect(waLink("123")).toBe("");
  });
});
