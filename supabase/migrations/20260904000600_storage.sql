-- ============================================================================
-- The Infinity Art — 06 storage buckets
--   logos   — shop logo / UPI QR
--   pdfs    — quotation / invoice / receipt PDFs (public so wa.me links resolve)
--   voice   — quick-add voice notes
--   artwork — client artwork, approvals, install photos
-- Phase 1 is a single shop; buckets are public-read, authenticated-write.
-- ============================================================================

insert into storage.buckets (id, name, public)
values
  ('logos',   'logos',   true),
  ('pdfs',    'pdfs',    true),
  ('voice',   'voice',   true),
  ('artwork', 'artwork', true)
on conflict (id) do nothing;

create policy "infinity_public_read" on storage.objects
  for select
  using (bucket_id in ('logos','pdfs','voice','artwork'));

create policy "infinity_auth_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('logos','pdfs','voice','artwork'));

create policy "infinity_auth_update" on storage.objects
  for update to authenticated
  using (bucket_id in ('logos','pdfs','voice','artwork'))
  with check (bucket_id in ('logos','pdfs','voice','artwork'));

create policy "infinity_auth_delete" on storage.objects
  for delete to authenticated
  using (bucket_id in ('logos','pdfs','voice','artwork'));
