// Apply a single migration file to DATABASE_URL. For a Vercel-Marketplace
// Supabase project where `supabase db push` can't authenticate (see README
// "Deploying" section) -- running the bulk migrations runner would re-run
// every earlier file too, which errors on tables that already exist.
//   DATABASE_URL="postgres://..." node scripts/apply-one-migration.mjs supabase/migrations/xyz.sql
import { readFile } from "node:fs/promises";
import { Client } from "pg";

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/apply-one-migration.mjs <path-to-migration.sql>");
  process.exit(1);
}
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
const sql = await readFile(file, "utf8");
await client.query(sql);
console.log("applied", file);
await client.end();
