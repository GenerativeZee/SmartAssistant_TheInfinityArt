-- ============================================================================
-- The Infinity Art — 02 domain tables
-- Every tenant table carries shop_id. created_at / updated_at on every table.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- clients — phone is identity, unique per shop
-- ---------------------------------------------------------------------------
create table public.clients (
  id                     uuid primary key default gen_random_uuid(),
  shop_id                uuid not null references public.shops(id) on delete cascade,
  name                   text not null,
  phone                  text,
  alt_phone              text,
  company                text,
  address                text,
  source                 text check (source in
                           ('walk_in','reference','instagram','google','whatsapp','repeat','other')),
  referred_by_client_id  uuid references public.clients(id) on delete set null,
  tags                   text[] not null default '{}',
  birthday               date,
  notes                  text,
  last_contacted_at      timestamptz,
  created_by             uuid references auth.users(id),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create unique index clients_shop_phone_key
  on public.clients(shop_id, phone) where phone is not null;
create index clients_shop_id_idx on public.clients(shop_id);
create index clients_shop_last_contacted_idx on public.clients(shop_id, last_contacted_at);
create trigger trg_clients_updated_at
  before update on public.clients for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- interactions — append-only touch log; feeds the client timeline
-- ---------------------------------------------------------------------------
create table public.interactions (
  id                uuid primary key default gen_random_uuid(),
  shop_id           uuid not null references public.shops(id) on delete cascade,
  client_id         uuid not null references public.clients(id) on delete cascade,
  type              text not null check (type in ('visit','call','whatsapp','note','voice')),
  summary           text,
  requirement_tags  text[] not null default '{}',
  voice_url         text,
  occurred_at       timestamptz not null default now(),
  created_by        uuid references auth.users(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index interactions_client_idx
  on public.interactions(shop_id, client_id, occurred_at desc);
create trigger trg_interactions_updated_at
  before update on public.interactions for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- follow_ups — the engine of the daily screen
-- ---------------------------------------------------------------------------
create table public.follow_ups (
  id            uuid primary key default gen_random_uuid(),
  shop_id       uuid not null references public.shops(id) on delete cascade,
  client_id     uuid not null references public.clients(id) on delete cascade,
  related_type  text not null default 'client'
                check (related_type in ('client','quotation','job','payment')),
  related_id    uuid,
  title         text not null,
  context       text,
  due_date      date not null,
  status        text not null default 'open'
                check (status in ('open','done','snoozed','dropped')),
  snoozed_to    date,
  drop_reason   text,
  completed_at  timestamptz,
  created_by    uuid references auth.users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index follow_ups_engine_idx on public.follow_ups(shop_id, status, due_date);
create index follow_ups_related_idx on public.follow_ups(shop_id, related_type, related_id);
create trigger trg_follow_ups_updated_at
  before update on public.follow_ups for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- services — the rate card
-- ---------------------------------------------------------------------------
create table public.services (
  id            uuid primary key default gen_random_uuid(),
  shop_id       uuid not null references public.shops(id) on delete cascade,
  name          text not null,
  category      text not null check (category in
                  ('signage','print','wedding','branding','web','other')),
  unit          text not null check (unit in ('sqft','piece','box','job','hour')),
  default_rate  numeric(12,2) not null default 0,
  hsn_sac       text,
  gst_rate      numeric(5,2),
  active        boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index services_shop_idx on public.services(shop_id, active, sort_order);
create trigger trg_services_updated_at
  before update on public.services for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- quotations + quotation_items
-- ---------------------------------------------------------------------------
create table public.quotations (
  id              uuid primary key default gen_random_uuid(),
  shop_id         uuid not null references public.shops(id) on delete cascade,
  client_id       uuid not null references public.clients(id) on delete restrict,
  number          text,
  quote_date      date not null default (now() at time zone 'Asia/Kolkata')::date,
  valid_until     date,
  status          text not null default 'draft'
                  check (status in ('draft','sent','followup','won','lost')),
  lost_reason     text check (lost_reason in
                    ('price','timeline','no_response','went_elsewhere','cancelled_project','other')),
  lost_note       text,
  subtotal        numeric(12,2) not null default 0,
  discount        numeric(12,2) not null default 0,
  taxable_amount  numeric(12,2) not null default 0,
  gst_amount      numeric(12,2) not null default 0,
  total           numeric(12,2) not null default 0,
  notes           text,
  terms           text,
  pdf_url         text,
  sent_at         timestamptz,
  decided_at      timestamptz,
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create unique index quotations_shop_number_key
  on public.quotations(shop_id, number) where number is not null;
create index quotations_shop_status_idx on public.quotations(shop_id, status);
create index quotations_client_idx on public.quotations(shop_id, client_id);
create trigger trg_quotations_updated_at
  before update on public.quotations for each row execute function public.set_updated_at();

create table public.quotation_items (
  id            uuid primary key default gen_random_uuid(),
  quotation_id  uuid not null references public.quotations(id) on delete cascade,
  service_id    uuid references public.services(id) on delete set null,
  description   text not null,
  unit          text not null check (unit in ('sqft','piece','box','job','hour')),
  qty           numeric(10,2) not null default 1,
  width_ft      numeric(8,2),
  height_ft     numeric(8,2),
  rate          numeric(12,2) not null default 0,
  gst_rate      numeric(5,2) not null default 0,
  amount        numeric(12,2) not null default 0,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index quotation_items_quote_idx on public.quotation_items(quotation_id, sort_order);
create trigger trg_quotation_items_updated_at
  before update on public.quotation_items for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- jobs + job_stage_events
-- ---------------------------------------------------------------------------
create table public.jobs (
  id            uuid primary key default gen_random_uuid(),
  shop_id       uuid not null references public.shops(id) on delete cascade,
  client_id     uuid not null references public.clients(id) on delete restrict,
  quotation_id  uuid references public.quotations(id) on delete set null,
  number        text,
  title         text not null,
  category      text check (category in
                  ('signage','print','wedding','branding','web','other')),
  stage         text not null default 'design'
                check (stage in
                  ('design','approval','print','finishing','installation','delivered','cancelled')),
  promised_date date,
  delivered_at  timestamptz,
  total_amount  numeric(12,2) not null default 0,
  notes         text,
  created_by    uuid references auth.users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create unique index jobs_shop_number_key
  on public.jobs(shop_id, number) where number is not null;
create index jobs_board_idx on public.jobs(shop_id, stage, promised_date);
create index jobs_client_idx on public.jobs(shop_id, client_id);
create trigger trg_jobs_updated_at
  before update on public.jobs for each row execute function public.set_updated_at();

create table public.job_stage_events (
  id          uuid primary key default gen_random_uuid(),
  job_id      uuid not null references public.jobs(id) on delete cascade,
  from_stage  text,
  to_stage    text not null,
  note        text,
  at          timestamptz not null default now(),
  by          uuid references auth.users(id),
  created_at  timestamptz not null default now()
);
create index job_stage_events_job_idx on public.job_stage_events(job_id, at);

-- ---------------------------------------------------------------------------
-- payments + expenses
-- ---------------------------------------------------------------------------
create table public.payments (
  id              uuid primary key default gen_random_uuid(),
  shop_id         uuid not null references public.shops(id) on delete cascade,
  client_id       uuid not null references public.clients(id) on delete restrict,
  job_id          uuid references public.jobs(id) on delete set null,
  kind            text not null default 'part' check (kind in ('advance','part','final')),
  amount          numeric(12,2) not null check (amount > 0),
  mode            text not null default 'cash' check (mode in ('cash','upi','bank','cheque')),
  reference       text,
  received_at     timestamptz not null default now(),
  receipt_number  text,
  note            text,
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create unique index payments_shop_receipt_key
  on public.payments(shop_id, receipt_number) where receipt_number is not null;
create index payments_client_idx on public.payments(shop_id, client_id);
create index payments_job_idx on public.payments(shop_id, job_id);
create trigger trg_payments_updated_at
  before update on public.payments for each row execute function public.set_updated_at();

create table public.expenses (
  id          uuid primary key default gen_random_uuid(),
  shop_id     uuid not null references public.shops(id) on delete cascade,
  category    text not null check (category in ('material','labour','transport','rent','other')),
  amount      numeric(12,2) not null check (amount > 0),
  spent_on    date not null default (now() at time zone 'Asia/Kolkata')::date,
  note        text,
  job_id      uuid references public.jobs(id) on delete set null,
  created_by  uuid references auth.users(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index expenses_shop_idx on public.expenses(shop_id, spent_on);
create trigger trg_expenses_updated_at
  before update on public.expenses for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- attachments — polymorphic file links
-- ---------------------------------------------------------------------------
create table public.attachments (
  id           uuid primary key default gen_random_uuid(),
  shop_id      uuid not null references public.shops(id) on delete cascade,
  entity_type  text not null check (entity_type in ('client','quotation','job')),
  entity_id    uuid not null,
  url          text not null,
  filename     text,
  kind         text not null default 'other'
               check (kind in ('artwork','approval','install_photo','other')),
  created_by   uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index attachments_entity_idx on public.attachments(shop_id, entity_type, entity_id);
create trigger trg_attachments_updated_at
  before update on public.attachments for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- sequences — per shop / per doc type / per financial year counters (§6.1)
-- ---------------------------------------------------------------------------
create table public.sequences (
  shop_id     uuid not null references public.shops(id) on delete cascade,
  doc_type    text not null check (doc_type in ('quotation','job','receipt')),
  fy          text not null,               -- '2526'
  last_value  bigint not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (shop_id, doc_type, fy)
);
create trigger trg_sequences_updated_at
  before update on public.sequences for each row execute function public.set_updated_at();
