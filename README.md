# The Infinity Art

Phone-first CRM for a design / printing / branding studio: capture clients fast,
turn conversations into quotations and jobs, track who owes money, and get one
"Aaj Ka Kaam" screen every morning. Full requirements in [`SPEC.md`](./SPEC.md).

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind v4 · Supabase (Postgres
+ Auth + Storage, RLS) · Zod · date-fns (`Asia/Kolkata`) · installable PWA ·
deploys to Vercel.

---

## Milestone status

**Phase 1 (M1–M6) is complete**, plus post-launch additions: client delete,
full Settings editing (shop profile, logo/UPI QR upload, editable WhatsApp
message templates), and expense capture. Everything in §12's acceptance
checklist is built and verified against the live database.

| | | |
|---|---|---|
| **M1** | Project, schema, RLS, seed, auth, four-tab shell | ✅ done |
| **M2** | Clients: quick add, list, search, timeline | ✅ done |
| **M3** | Rate card + quotation builder, PDF, WhatsApp share | ✅ done |
| **M4** | Jobs: from won quote, board, stage stepper, delivery | ✅ done |
| **M5** | Payments, receivables + ageing, receipts | ✅ done |
| **M6** | Aaj Ka Kaam, auto follow-ups, PWA install, Excel export, rate card editor | ✅ done |

---

## Setup

### 1. Install

```bash
npm install
```

### 2. Supabase

**Option A — local (needs Docker):**

```bash
npx supabase start           # prints API URL + anon key + db URL
npx supabase db reset        # applies migrations + seed.sql
```

**Option B — hosted project:**

```bash
npx supabase link --project-ref <ref>
npx supabase db push         # applies supabase/migrations/
# then run supabase/seed.sql once from the SQL editor or:
#   psql "$DATABASE_URL" -f supabase/seed.sql
```

### 3. Env

```bash
cp .env.local.example .env.local
# fill NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY from step 2
```

### 4. Create the owner login

Sign up once — the first auth user is auto-linked to the seeded shop
(`handle_new_user` trigger).

- **Local:** open Supabase Studio (`http://127.0.0.1:54323`) → Authentication →
  Add user → enter email + password, tick "Auto Confirm".
- **Hosted:** Authentication → Users → Add user.

### 5. Run

```bash
npm run dev            # http://localhost:3000  -> redirects to /login
```

Log in with the user from step 4. You land on **Aaj**.

---

## Scripts

| Script | What |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest — pricing, GST, ageing, money, numbering |
| `npm run db:reset` | Re-apply migrations + seed (local) |
| `npm run db:types` | Regenerate `src/lib/database.types.ts` from the local DB |
| `npm run gen:icons` | Re-render PWA icons from `public/icons/icon.svg` |

### Numbering concurrency test

`tests/numbering.test.ts` needs Postgres. It skips itself when `DATABASE_URL`
is unreachable, so `npm test` is green without Docker. To run it:

```bash
npx supabase start && npx supabase db reset
npm test                 # DATABASE_URL is read from .env.local
```

---

## Deploying (Vercel + a Marketplace-provisioned Supabase)

If Supabase was installed via the **Vercel Marketplace integration** (Storage tab
→ Supabase), the resulting project is managed through Vercel, not your own
Supabase.com account — `supabase link` / `supabase db push` will fail with a
permissions error even with a valid personal access token. Push the schema
straight to Postgres instead, using the pooled connection string Vercel's
Storage tab shows you (`POSTGRES_URL` / the integration's "Connect" panel):

```bash
DATABASE_URL="postgres://...pooler.supabase.com:6543/postgres" node scripts/run-remote-sql.mjs migrations
DATABASE_URL="postgres://...pooler.supabase.com:6543/postgres" node scripts/run-remote-sql.mjs seed   # optional
```

Then create the owner login the supported way — the GoTrue Admin API, using
the **`service_role`** key from the same Storage panel (never craft
`auth.users`/`auth.identities` rows by hand; hosted GoTrue's internal session
queries expect state a raw INSERT won't reliably reproduce):

```bash
curl -X POST "https://<ref>.supabase.co/auth/v1/admin/users" \
  -H "apikey: <service_role key>" -H "Authorization: Bearer <service_role key>" \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@example.com","password":"...","email_confirm":true}'
```

Finally, confirm Vercel's env vars are named exactly `NEXT_PUBLIC_SUPABASE_URL`
and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the app reads those literal names — see
`src/lib/env.ts`); the Marketplace integration may only add `SUPABASE_URL`
(no `NEXT_PUBLIC_` prefix), which the browser bundle can't see.

## Backups (§10)

Nightly `pg_dump` of the whole database:

```bash
# hosted
pg_dump "postgresql://postgres:<pwd>@db.<ref>.supabase.co:5432/postgres" \
  --no-owner --format=custom -f "infinity-$(date +%F).dump"

# local
pg_dump "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  --no-owner --format=custom -f "infinity-$(date +%F).dump"

# restore
pg_restore --no-owner --clean --if-exists -d "<target-db-url>" infinity-YYYY-MM-DD.dump
```

Settings → **Export everything to Excel** (M6) is the second, in-app backup.

---

## Architecture notes

- **Multi-tenant from day one.** Every table has `shop_id`; every RLS policy
  checks it against `auth_shop_id()` (the caller's `profiles.shop_id`). One shop
  exists in Phase 1; nothing about it is hardcoded — it all lives in `shops`.
- **Document numbers** (`INF/Q/2526/0042`) come from `next_document_number()` in
  Postgres, using `sequences` + `SELECT … FOR UPDATE`. Never generated in app code.
- **Money** is `numeric(12,2)`; all maths in `src/lib/pricing.ts` / `money.ts`;
  displayed via `Intl.NumberFormat('en-IN')`.
- **"Today"** is always `Asia/Kolkata`, computed server-side (`src/lib/dates.ts`).
- **UI strings** live in `src/lib/strings.ts` (Hinglish for actions, English for
  data) so the language can be switched later.
- `proxy.ts` (Next 16's renamed middleware) refreshes the Supabase session and
  gates every route behind auth except `/login` and the manifest/icons.
