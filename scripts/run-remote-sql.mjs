// One-off: apply migrations + seed to a remote Postgres (used when the
// Supabase CLI can't reach a Vercel-Marketplace-provisioned project).
//   DATABASE_URL="postgres://..." node scripts/run-remote-sql.mjs migrations
//   DATABASE_URL="postgres://..." node scripts/run-remote-sql.mjs seed
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";

const mode = process.argv[2]; // "migrations" | "seed"
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Set DATABASE_URL");
  process.exit(1);
}

const root = path.resolve(import.meta.dirname, "..", "supabase");

async function filesFor(mode) {
  if (mode === "seed") return [path.join(root, "seed.sql")];
  const dir = path.join(root, "migrations");
  const names = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  return names.map((f) => path.join(dir, f));
}

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
await client.connect();
console.log("connected");

for (const file of await filesFor(mode)) {
  const sql = await readFile(file, "utf8");
  process.stdout.write(`applying ${path.basename(file)} ... `);
  try {
    await client.query(sql);
    console.log("ok");
  } catch (err) {
    console.log("FAILED");
    console.error(err.message);
    await client.end();
    process.exit(1);
  }
}

await client.end();
console.log("done");
