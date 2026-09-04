# The Infinity Art — Phase 1 Spec

> This file is the source of truth. Update the **Decisions Log** whenever a decision changes.

---

## Decisions Log

| # | Decision | Date | Note |
|---|---|---|---|
| D1 | App lives in `the-infinity-art/` subdirectory of the workspace. | 2026-09-04 | `npm` naming rules reject the capitalised workspace folder name. |
| D2 | Next.js 16 (App Router) + React 19 + Tailwind CSS v4 (CSS-first `@theme`). | 2026-09-04 | Scaffolded with `create-next-app@latest`. |
| D3 | No shadcn install. Hand-built Tailwind primitives; Radix only where a11y needs it (Dialog/Sheet). | 2026-09-04 | §3/§9 forbid the default shadcn look; cheaper to build clean than override. |
| D4 | Ageing buckets implemented as `0–15 / 16–30 / 31+`, the third labelled "30+ din". | 2026-09-04 | Spec labels overlap at day 30; confirmed by client. |
| D5 | **Paisa tab** shows every receivable (`balance > 0`). The 7-day floor is applied **only** on Aaj Ka Kaam. | 2026-09-04 | Confirmed by client. |
| D6 | Ageing clock starts at `jobs.delivered_at`. Undelivered balances never age and never appear in "Paisa baaki". | 2026-09-04 | Matches `client_balances.oldest_unpaid_delivered_at` and §12. |
| D7 | Quick-add requirement chips derive from the 6 `services.category` values (Hinglish labels) + fixed "Mockup" and "Other". Stored on `interactions.requirement_tags`. | 2026-09-04 | Confirmed by client. |
| D8 | Document-number letters come from `shops.doc_prefix` (default `INF`), not hardcoded, to stay multi-tenant per §4. Format unchanged: `INF/Q/2526/0042`. | 2026-09-04 | |
| D9 | First Supabase auth signup is auto-linked to the single seeded shop via an `auth.users` insert trigger. | 2026-09-04 | No onboarding screen in Phase 1. |
| D10 | CGST/SGST split: `cgst = round(gst/2, 2)`, `sgst = gst − cgst`, so halves always re-sum. IGST left as a `TODO`. | 2026-09-04 | §6.3 intra-state assumption. |
| D11 | Tests run on Vitest. Numbering-concurrency test needs a local Supabase/Postgres. | 2026-09-04 | |
| D12 | PWA: Serwist caches the app shell + static assets only. Offline = shell opens + in-progress forms survive via localStorage. No offline data sync. | 2026-09-04 | §3/§10. |
| D13 | Fonts: Archivo (headings/names), JetBrains Mono (all numbers/dates/doc numbers, tabular). | 2026-09-04 | §9. |
| D14 | Excel export = server action using `exceljs`, one sheet per table, shop-scoped. | 2026-09-04 | §8.7. |
| D15 | App UI language switched from Hinglish to **English** throughout — screen titles, labels, buttons, validation, empty states. | 2026-09-04 | Client said Shahid is comfortable reading English and asked for it explicitly. **Overrides §9 "Hinglish for anything he acts on."** The outbound WhatsApp templates in `lib/messages.ts` (§7) are left Hinglish — those are written to his customers, a different audience, and §7's exact wording was spec'd deliberately; flag if that should change too. |
| D16 | Coming-soon placeholders (Jobs/Paisa boards, Aaj Ka Kaam) drop the internal milestone code ("M4", "M6") from the visible UI — shown only as a quiet "Coming soon" + one plain-English line. Login screen redesigned with a mark + card treatment instead of a bare form. | 2026-09-04 | "Make the app look professional" — milestone jargon reads as a dev tool, not a product, to an end user. |

---

## 1. Context

**The client.** Shahid runs *The Infinity Art*, a design, printing and branding studio in India. The shop does signage (flex, vinyl, ACP boards, acrylic letters, glow signs), print work (visiting cards, brochures, standees), wedding invitations, logo and brand identity design, mockups, and website/app development.

**The problem.** He is the only point of contact for every client. People walk in, discuss work, take quotations, ask for demos, promise to confirm "Monday". He forgets who to call and about what. He forgets who owes money. Jobs get delivered late because a design sat unapproved for a week. He has no idea what he earned last month or which service actually makes money.

**The user.** Shahid, alone, on his phone, standing at a counter, often with a customer in front of him. He is not a software person. He reads Hinglish faster than English.

**The single hard constraint that governs every design decision:**

> If logging a client visit takes longer than replying to a WhatsApp message, he will stop using the app within three weeks and the whole project is worthless.

Ten seconds and four taps to capture a new visit. Everything else is optional and can be filled in later. When you have to choose between "more complete data" and "faster entry", choose faster entry every single time.

## 2. What Phase 1 must do

1. Capture clients and every conversation with them, fast.
2. Turn a conversation into a quotation with a professional PDF, in under two minutes.
3. Turn a won quotation into a job with a promised delivery date and a stage, without re-typing anything.
4. Track money: what a job is worth, what was received, what is still owed, and how old the debt is.
5. Every morning, produce **one screen** that tells him what to do today.

Phase 1 does **not** include: automatic message sending, the customer-facing order-tracking page, expense reporting and profit charts, staff logins, inventory, e-invoicing. Do not build them. Do leave the schema ready for them.

## 3. Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router), TypeScript, server actions |
| Styling | Tailwind CSS. shadcn/ui allowed only with theme fully overridden per §8 — no default shadcn look |
| Database + auth + file storage | Supabase (Postgres). Row Level Security on from the start |
| Validation | Zod on every server action |
| PDF | `@react-pdf/renderer`, generated client-side, uploaded to Supabase Storage |
| Dates | `date-fns`, `Asia/Kolkata` everywhere |
| Deploy target | Vercel |
| App shape | Installable PWA — manifest, icons, service worker caching the app shell |

Money is `numeric(12,2)`. Never floats. Display with `Intl.NumberFormat('en-IN')` → `₹1,42,500`.

## 4. Multi-tenancy

Every table carries `shop_id`. Every query filters by it. Every RLS policy enforces it. Shop name, logo, address, GSTIN, UPI ID, and rate card all live in the `shops` table, never hardcoded.

## 5. Data model

See `supabase/migrations/`. `uuid` PKs with `gen_random_uuid()`, `timestamptz` for instants, `date` for calendar dates, `created_at`/`updated_at` on every table.

(Tables: shops, profiles, clients, interactions, follow_ups, services, quotations, quotation_items, jobs, job_stage_events, payments, expenses, attachments, plus `sequences` for numbering. Views: `client_balances`, `job_financials`.)

## 6. Business logic

### 6.1 Document numbering
Indian FY April–March. `INF/Q/2526/0042` (quotation), `INF/J/2526/0117` (job), `INF/R/2526/0088` (receipt). `2526` = FY 2025–26. Sequence per shop, per type, per FY. Generated in a Postgres function using a `sequences` table with `SELECT ... FOR UPDATE`.

### 6.2 Square-foot pricing
For `unit = 'sqft'`: `amount = area × qty × rate`, `area = width_ft × height_ft`. If `shops.sqft_rounding = 'up_to_whole'`, round `area` **up** to the next whole sq.ft before multiplying. Line editor shows size inputs only for sqft items and displays live area: `12 × 4 ft = 48 sq.ft`.

### 6.3 GST
Per-item `gst_rate`, default from service, then shop. Phase 1 = intra-state: split GST into CGST + SGST at half each on the PDF. Store total `gst_amount`; derive split at render. `TODO` for IGST.

### 6.4 Quotation → Job conversion
Marking a quotation `won` opens one confirm sheet: promised delivery date, starting stage (default `design`), optional advance received. On confirm, one transaction: create job with `total_amount` = quotation total, link `quotation_id`, record advance as a payment if entered, close open follow-ups attached to that quotation, create a new follow-up for the promised date.

### 6.5 Automatic follow-ups

| Event | Follow-up |
|---|---|
| New client captured with "call back" chosen | on the date he picked |
| Quotation marked `sent` | `sent_at + 3 days`, "Quotation ka follow-up" |
| Job moved to `approval` | `+2 days`, "Approval pending — kaam ruka hua hai" |
| Job `promised_date` reached, not delivered | same day, "Delivery aaj hai" |
| Job delivered with balance > 0 | `+7 days`, "Payment reminder" |

Complete → `status='done'`. Snooze → `status='snoozed'`, `snoozed_to = tomorrow` (or picked date); it reappears. Only explicit "Drop" → `status='dropped'`, and it asks why.

### 6.6 Aaj Ka Kaam query
Three sections, server-side, today in `Asia/Kolkata`:

* **Call karna hai** — `follow_ups` where (`status='open'` and `due_date <= today`) or (`status='snoozed'` and `snoozed_to <= today`). Oldest first. Overdue → red left border.
* **Paisa baaki** — `client_balances` where `balance > 0` and `days_outstanding >= 7`. Sort `days_outstanding` desc. Ageing chip: `0–15 din`, `16–30 din`, `30+ din`.
* **Aaj / kal delivery** — `jobs` where `stage NOT IN ('delivered','cancelled')` and `promised_date <= today + 1`. Past promised date sorts to top, reads `LATE`.

Headers carry a count and, for money, a total: `Paisa baaki · ₹1,42,500`.

If all three empty: show month-so-far numbers and the three oldest clients not contacted in 90 days. Never blank.

## 7. WhatsApp — deep links only

`https://wa.me/91{10-digit}?text={encodeURIComponent(message)}`. PDF flow: generate → upload to Storage → public URL → put URL in message text. `sharePdf(entity)` helper reused by quotation, invoice, receipt. Templates live in `lib/messages.ts`. Every message opens in an editable preview before sending.

## 8. Screens

Bottom tab bar: **Aaj · Clients · Jobs · Paisa**. Floating `+` on every tab → quick-add sheet. Nothing more than three taps deep.

- **8.1 Aaj Ka Kaam** — the three §6.6 sections. Each row: name, one context line, actions Call (`tel:`) / WhatsApp / Done·Kal. Money rows show amount right-aligned, tabular. Row body → client. Actions never navigate.
- **8.2 Quick add** — one sheet: (1) phone, numeric, autofocus, on blur match existing → switch; (2) name; (3) requirement chips multi-select; (4) What next: Call back / Quotation bhejna / Demo dikhana / Kuch nahi — first three reveal date row Kal / 2 din / Is hafte / pick; (5) mic → voice note upload → `interaction` type `voice`. Save → toast `Saved · <name>`, back to where he was.
- **8.3 Client detail** — header (name, company, phone + call/WA, total business, balance red if non-zero); one reverse-chronological timeline mixing interactions/quotations/jobs/payments; "Naya quotation" / "Naya job".
- **8.4 Quotation builder** — client → items → send. Rate-card rows in one tap, rate editable. sqft rows: W/H inputs + live area. Running total pinned bottom (subtotal, GST, grand total). Preview PDF / WhatsApp bhejo / Save as draft. List grouped by status with counts; `sent` older than 3 days flagged.
- **8.5 Jobs board** — list sorted by promised date (not kanban). Groups: `Late` / `Aaj` / `Is hafte` / `Baad mein`. Colour: red late, amber ≤2 days, neutral else. Job detail: horizontal stage stepper (tap to advance + optional note), promised date, financials, attachments, delivery action (asks final payment, offers delivery WA message).
- **8.6 Paisa** — tabs **Aana hai** (receivables grouped by ageing bucket, running total on top) and **Aaya** (payments received, newest first, month total). Payment sheet: amount, mode, against job, date. Save → receipt number + receipt WA message.
- **8.7 Settings** — shop profile, logo upload, GSTIN, UPI ID + QR, default GST rate, sqft rounding, greeting word, quotation terms, message templates, rate-card editor, **Export everything to Excel**.

## 9. Design direction

- **Palette.** Ink `#0F1518` on paper `#F4F7F8`, white surfaces. Accent: process cyan `#0083B8`. Semantic ladder: cyan = running/on track, amber `#B67A00` = at risk, magenta `#C4005F` = overdue & money owed, ink = done. No fourth accent. Light + dark via CSS variables: full light palette on `:root`, override tokens only in `@media (prefers-color-scheme: dark)`.
- **Type.** Wide grotesque for headings/names (Archivo). Mono with tabular figures for every number/amount/date/doc number.
- **Density.** 44px min tap targets, tight vertical rhythm. Amounts right-aligned. Dates `04 Sep`, never `2026-09-04`.
- **Language.** English throughout the app UI (D15). Outbound WhatsApp templates stay Hinglish — a different audience. Strings in `lib/strings.ts`.
- **Avoid.** Purple/blue gradient headers, card shadows on everything, emoji section icons, generic SaaS empty states, default shadcn styling.

## 10. Non-functional

- RLS from the first migration; every policy checks `shop_id` against the caller's `profiles.shop_id`.
- Auth: email + password via Supabase for the owner.
- Form resilience: quick-add and payment sheets persist to localStorage while open.
- Nightly backup: documented `pg_dump` in README + the Excel export.
- Timezone: all "today" logic in `Asia/Kolkata`, on the server.
- Seed script: The Infinity Art with a realistic rate card, 12 clients, 6 quotations across all statuses, 8 jobs across every stage incl. two late, payments populating all three ageing buckets, 5 open follow-ups of which 2 overdue. Aaj Ka Kaam must look alive on first open.

## 11. Milestones

- **M1** — Project, schema, RLS, seed, auth, empty shell with four tabs.
- **M2** — Clients: quick add, list, search, client detail timeline.
- **M3** — Rate card + quotation builder, PDF, WhatsApp share.
- **M4** — Jobs: creation from won quotation, board, stage stepper, delivery.
- **M5** — Payments, receivables with ageing, receipts.
- **M6** — Aaj Ka Kaam, automatic follow-up generation, PWA install, Excel export.

Commit at every milestone. Tests for: document numbering under concurrency, sqft area rounding, GST totals, balance calculation, ageing bucket boundaries.

## 12. Acceptance checklist

- [ ] New walk-in + call-back captured in < 10s on a phone.
- [ ] Existing phone number opens the existing client, no duplicate.
- [ ] 12 × 4 ft flex @ ₹15/sq.ft → line ₹720; total with 18% GST → ₹849.60.
- [ ] Quotation numbers unique + sequential per FY, even two in the same second.
- [ ] Won quotation → job created, total carried, advance recorded, delivery follow-up scheduled — two user inputs.
- [ ] Delivered job with balance appears in "Paisa baaki" 7 days later, correct ageing bucket.
- [ ] Every WhatsApp message opens in an editable preview with a working PDF link.
- [ ] Aaj Ka Kaam never empty, never needs scrolling to understand the day.
- [ ] Settings exports every table to one Excel workbook.
- [ ] App installs to an Android home screen, opens without browser chrome.
