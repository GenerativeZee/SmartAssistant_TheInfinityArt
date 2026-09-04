import { z } from "zod";

/**
 * Any Postgres `uuid` value — not just "real" RFC 4122 v1-v8 UUIDs.
 *
 * Zod v4's `.uuid()` requires a valid version/variant nibble by default,
 * which rejects perfectly valid Postgres uuid values that don't happen to
 * carry those bits — e.g. this project's seed data uses hand-made,
 * human-readable ids like `c0000000-0000-0000-0000-000000000001` so rows are
 * easy to cross-reference while debugging. Use this everywhere a uuid column
 * value is validated instead of `z.string().uuid()`.
 */
export const uuidLike = z
  .string()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "Invalid id");
