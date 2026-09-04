/**
 * Document numbering under concurrency (§6.1, §12).
 *
 * Needs a running Postgres with the migrations applied. Point DATABASE_URL at it
 * (the local Supabase default is filled in below). When it is unreachable the
 * suite skips rather than failing, so `npm test` stays green without Docker.
 *
 *   supabase start                            # applies migrations + seed
 *   DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres npm test
 *
 * A real race needs real parallel connections, so this uses a pg Pool — a
 * single Client serialises queries and would only prove sequential uniqueness.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Pool } from "pg";

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

let pool: Pool | null = null;
let reachable = false;
const SHOP_ID = "9f9f9f9f-0000-4000-8000-000000000abc";

beforeAll(async () => {
  pool = new Pool({ connectionString: DATABASE_URL, max: 24 });
  try {
    await pool.query("select 1");
    reachable = true;
    await pool.query("delete from public.shops where id = $1", [SHOP_ID]);
    await pool.query("insert into public.shops (id, name, doc_prefix) values ($1, $2, 'INF')", [
      SHOP_ID,
      "Numbering Test Shop",
    ]);
  } catch {
    reachable = false;
  }
});

afterAll(async () => {
  if (pool && reachable) await pool.query("delete from public.shops where id = $1", [SHOP_ID]);
  if (pool) await pool.end().catch(() => {});
});

describe("next_document_number", () => {
  it("is unique + gap-free when 50 calls race across connections", async () => {
    if (!reachable) {
      console.warn("[numbering] DATABASE_URL unreachable — skipping concurrency test");
      return;
    }

    const N = 50;
    const results = await Promise.all(
      Array.from({ length: N }, () =>
        pool!
          .query<{ n: string }>("select public.next_document_number($1, 'quotation') as n", [SHOP_ID])
          .then((r) => r.rows[0].n),
      ),
    );

    expect(new Set(results).size).toBe(N); // all unique

    const seq = results.map((s) => Number(s.split("/").pop())).sort((a, b) => a - b);
    expect(seq[0]).toBe(1);
    expect(seq[N - 1]).toBe(N);
    for (let i = 0; i < N; i++) expect(seq[i]).toBe(i + 1); // gap-free 1..N

    const fy = results[0].split("/")[2];
    expect(results).toContain(`INF/Q/${fy}/0001`);
    expect(results).toContain(`INF/Q/${fy}/0050`);
  });

  it("formats job and receipt numbers with the right letter", async () => {
    if (!reachable) return;
    const [job, receipt] = await Promise.all([
      pool!
        .query<{ n: string }>("select public.next_document_number($1, 'job') as n", [SHOP_ID])
        .then((r) => r.rows[0].n),
      pool!
        .query<{ n: string }>("select public.next_document_number($1, 'receipt') as n", [SHOP_ID])
        .then((r) => r.rows[0].n),
    ]);
    expect(job).toMatch(/^INF\/J\/\d{4}\/0001$/);
    expect(receipt).toMatch(/^INF\/R\/\d{4}\/0001$/);
  });
});
