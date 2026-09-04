-- ============================================================================
-- The Infinity Art — 05 Row Level Security
-- Every tenant policy checks shop_id against the caller's profiles.shop_id
-- via auth_shop_id(). RLS is ON for every table from here.
-- ============================================================================

-- ---------- shops --------------------------------------------------------------
alter table public.shops enable row level security;

create policy shops_select on public.shops
  for select using (id = public.auth_shop_id());

create policy shops_update on public.shops
  for update using (id = public.auth_shop_id())
  with check (id = public.auth_shop_id());
-- insert/delete: seed / service-role only.

-- ---------- profiles ---------------------------------------------------------
alter table public.profiles enable row level security;

create policy profiles_select on public.profiles
  for select using (id = auth.uid() or shop_id = public.auth_shop_id());

create policy profiles_update on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());
-- insert: handled by the security-definer handle_new_user() trigger.

-- ---------- generic tenant tables (own shop_id column) ----------------------
do $$
declare
  t text;
  tenant_tables text[] := array[
    'clients','interactions','follow_ups','services',
    'quotations','jobs','payments','expenses','attachments'
  ];
begin
  foreach t in array tenant_tables loop
    execute format('alter table public.%I enable row level security;', t);
    execute format($p$
      create policy %1$s_rw on public.%1$I
        for all
        using (shop_id = public.auth_shop_id())
        with check (shop_id = public.auth_shop_id());
    $p$, t);
  end loop;
end;
$$;

-- ---------- child tables without their own shop_id -------------------------
alter table public.quotation_items enable row level security;
create policy quotation_items_rw on public.quotation_items
  for all
  using (exists (
    select 1 from public.quotations q
    where q.id = quotation_id and q.shop_id = public.auth_shop_id()
  ))
  with check (exists (
    select 1 from public.quotations q
    where q.id = quotation_id and q.shop_id = public.auth_shop_id()
  ));

alter table public.job_stage_events enable row level security;
create policy job_stage_events_rw on public.job_stage_events
  for all
  using (exists (
    select 1 from public.jobs j
    where j.id = job_id and j.shop_id = public.auth_shop_id()
  ))
  with check (exists (
    select 1 from public.jobs j
    where j.id = job_id and j.shop_id = public.auth_shop_id()
  ));

-- ---------- sequences: readable by the shop, writable only via the
--            security-definer numbering function ----------------------------
alter table public.sequences enable row level security;
create policy sequences_select on public.sequences
  for select using (shop_id = public.auth_shop_id());
