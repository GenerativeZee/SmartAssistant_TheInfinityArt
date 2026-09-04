-- ============================================================================
-- The Infinity Art — 08 shops.message_templates
-- Settings -> Message templates (§8.7). Overrides for the four wa.me
-- templates in lib/messages.ts; a key missing here just falls back to the
-- built-in default, so this can start out empty.
-- ============================================================================

alter table public.shops
  add column if not exists message_templates jsonb not null default '{}'::jsonb;
