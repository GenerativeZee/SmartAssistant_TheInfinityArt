/**
 * Fail loudly if Supabase is not configured — client and server both.
 *
 * IMPORTANT: `NEXT_PUBLIC_*` vars are inlined into the browser bundle by
 * Next's compiler via static text replacement of the exact expression
 * `process.env.NEXT_PUBLIC_X` — it does NOT evaluate `process.env` as a real
 * object at runtime in the browser. A dynamic/bracket lookup like
 * `process.env[name]` is invisible to that step and reads as `undefined` in
 * every browser bundle, even though the value is correctly set. So every
 * `NEXT_PUBLIC_*` read below must be a literal, static member expression.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function must(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Missing env var ${name}. Copy .env.local.example to .env.local and fill it in.`,
    );
  }
  return value;
}

export const env = {
  supabaseUrl: must(supabaseUrl, "NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: must(supabaseAnonKey, "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};
