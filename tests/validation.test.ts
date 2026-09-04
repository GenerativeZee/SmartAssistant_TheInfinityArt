import { describe, it, expect } from "vitest";
import { uuidLike } from "@/lib/validation/common";
import { quotationInputSchema } from "@/lib/validation/quotations";

describe("uuidLike accepts any Postgres uuid, not just RFC 4122 v1-v8 (regression)", () => {
  it("accepts a real gen_random_uuid()-shaped value", () => {
    expect(uuidLike.safeParse("83ebf3d0-40b4-43a3-9f31-472b693b224d").success).toBe(true);
  });

  it("accepts the seed data's hand-made sequential ids", () => {
    // These are what supabase/seed.sql actually uses -- e.g. clients c1..c12.
    // Zod v4's .uuid() rejects these because the version/variant nibbles
    // aren't set, even though Postgres's uuid type accepts them fine.
    expect(uuidLike.safeParse("c0000000-0000-0000-0000-000000000001").success).toBe(true);
    expect(uuidLike.safeParse("40000000-0000-0000-0000-000000000001").success).toBe(true);
    expect(uuidLike.safeParse("11111111-1111-1111-1111-111111111111").success).toBe(true);
  });

  it("still rejects non-uuid-shaped strings", () => {
    expect(uuidLike.safeParse("not-a-uuid").success).toBe(false);
    expect(uuidLike.safeParse("").success).toBe(false);
    expect(uuidLike.safeParse("c0000000-0000-0000-0000-00000000000").success).toBe(false); // short
  });
});

describe("quotationInputSchema against a seeded client (regression)", () => {
  it("validates a quote for a seed-data client id", () => {
    const result = quotationInputSchema.safeParse({
      clientId: "c0000000-0000-0000-0000-000000000001",
      items: [
        {
          serviceId: "50000000-0000-0000-0000-000000000001",
          description: "Flex board",
          unit: "sqft",
          qty: 1,
          widthFt: 12,
          heightFt: 4,
          rate: 15,
          gstRate: 18,
        },
      ],
      discount: 0,
    });
    expect(result.success).toBe(true);
  });
});
