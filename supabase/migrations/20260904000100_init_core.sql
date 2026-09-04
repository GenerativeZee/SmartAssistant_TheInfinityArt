-- ============================================================================
-- The Infinity Art — 01 core: extensions, shared helpers, shops, profiles, auth
-- ============================================================================

create extension if not exists pgcrypto;      -- gen_random_uuid()

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- shops — the tenant root. All branding + config lives here, nothing hardcoded.
-- ---------------------------------------------------------------------------
create table public.shops (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  legal_name        text,
  logo_url          text,
  address           text,
  city              text,
  state             text,
  pincode           text,
  phone             text,
  whatsapp_number   text,
  email             text,
  gstin             text,
  upi_id            text,
  upi_qr_url        text,
  doc_prefix        text not null default 'INF',      -- D8: numbering letters, per shop
  default_gst_rate  numeric(5,2) not null default 18,
  sqft_rounding     text not null default 'up_to_whole'
                    check (sqft_rounding in ('none','up_to_whole')),
  default_greeting  text not null default 'ji',
  built_by_credit   text,
  quotation_terms   text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create trigger trg_shops_updated_at
  before update on public.shops
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- profiles — one row per auth user, ties user -> shop + role
-- ---------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  shop_id     uuid not null references public.shops(id) on delete cascade,
  name        text,
  phone       text,
  role        text not null default 'owner' check (role in ('owner','staff')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index profiles_shop_id_idx on public.profiles(shop_id);
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- auth_shop_id() — the shop_id of the current user. SECURITY DEFINER so RLS
-- policies can call it without recursing into profiles' own policies.
-- ---------------------------------------------------------------------------
create or replace function public.auth_shop_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select shop_id from public.profiles where id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- handle_new_user — D9: link every new signup to the single Phase 1 shop
-- (the earliest-created shop). Creates a placeholder shop only if none exists.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_shop uuid;
begin
  select id into v_shop from public.shops order by created_at asc limit 1;

  if v_shop is null then
    insert into public.shops (name) values ('My Shop') returning id into v_shop;
  end if;

  insert into public.profiles (id, shop_id, name, role)
  values (
    new.id,
    v_shop,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'owner'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
