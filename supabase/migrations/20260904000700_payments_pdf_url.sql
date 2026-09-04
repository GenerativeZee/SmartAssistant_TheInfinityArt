-- ============================================================================
-- The Infinity Art — 07 payments.pdf_url
-- Receipts get a PDF too (§3: "reused by quotation, invoice and receipt"),
-- generated + uploaded the same way as quotations. quotations already has
-- this column; payments never got one until M5 needed it.
-- ============================================================================

alter table public.payments add column if not exists pdf_url text;
