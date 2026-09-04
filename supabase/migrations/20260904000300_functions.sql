-- ============================================================================
-- The Infinity Art — 03 functions & triggers
--   * fy_code / next_document_number  (concurrency-safe numbering, §6.1)
--   * convert_quotation_to_job        (§6.4)
--   * automatic follow-up triggers    (§6.5)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- fy_code(date) -> Indian financial-year code, e.g. 2025-06-01 -> '2526'
-- FY runs April..March. April 2026 -> '2627'.
-- ---------------------------------------------------------------------------
create or replace function public.fy_code(d date)
returns text
language plpgsql
immutable
as $$
declare
  y int := extract(year from d)::int;
  m int := extract(month from d)::int;
  start_y int;
begin
  if m >= 4 then
    start_y := y;
  else
    start_y := y - 1;
  end if;
  return lpad((start_y % 100)::text, 2, '0') || lpad(((start_y + 1) % 100)::text, 2, '0');
end;
$$;

-- ---------------------------------------------------------------------------
-- next_document_number(shop, type) -> 'INF/Q/2526/0042'
-- Uses the sequences table with SELECT ... FOR UPDATE so two fast taps within
-- the same second can never collide. Never generate numbers in app code.
-- ---------------------------------------------------------------------------
create or replace function public.next_document_number(p_shop_id uuid, p_doc_type text)
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_fy      text := public.fy_code((now() at time zone 'Asia/Kolkata')::date);
  v_next    bigint;
  v_prefix  text;
  v_letter  text;
begin
  if p_doc_type not in ('quotation','job','receipt') then
    raise exception 'unknown doc_type %', p_doc_type;
  end if;

  insert into public.sequences (shop_id, doc_type, fy, last_value)
  values (p_shop_id, p_doc_type, v_fy, 0)
  on conflict (shop_id, doc_type, fy) do nothing;

  select last_value + 1 into v_next
  from public.sequences
  where shop_id = p_shop_id and doc_type = p_doc_type and fy = v_fy
  for update;

  update public.sequences
  set last_value = v_next
  where shop_id = p_shop_id and doc_type = p_doc_type and fy = v_fy;

  select doc_prefix into v_prefix from public.shops where id = p_shop_id;
  v_prefix := coalesce(v_prefix, 'INF');

  v_letter := case p_doc_type
    when 'quotation' then 'Q'
    when 'job'       then 'J'
    when 'receipt'   then 'R'
  end;

  return v_prefix || '/' || v_letter || '/' || v_fy || '/' || lpad(v_next::text, 4, '0');
end;
$$;

-- ---------------------------------------------------------------------------
-- convert_quotation_to_job — one transaction, two user inputs (§6.4, §12)
-- Returns the new job id.
-- ---------------------------------------------------------------------------
create or replace function public.convert_quotation_to_job(
  p_quotation_id   uuid,
  p_promised_date  date,
  p_starting_stage text    default 'design',
  p_advance_amount numeric default 0,
  p_advance_mode   text    default 'cash'
)
returns uuid
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  q          public.quotations%rowtype;
  v_job_id   uuid;
  v_job_no   text;
  v_receipt  text;
  v_uid      uuid := auth.uid();
  v_title    text;
begin
  select * into q from public.quotations where id = p_quotation_id;
  if not found then
    raise exception 'quotation % not found', p_quotation_id;
  end if;
  if q.shop_id <> public.auth_shop_id() then
    raise exception 'not authorized for this shop';
  end if;

  if p_starting_stage not in
     ('design','approval','print','finishing','installation','delivered','cancelled') then
    raise exception 'bad starting stage %', p_starting_stage;
  end if;

  update public.quotations
  set status = 'won', decided_at = now()
  where id = p_quotation_id;

  select coalesce(
           nullif(string_agg(description, ', ' order by sort_order), ''),
           'Job'
         )
  into v_title
  from (
    select description, sort_order
    from public.quotation_items
    where quotation_id = q.id
    order by sort_order
    limit 3
  ) s;

  v_job_no := public.next_document_number(q.shop_id, 'job');

  insert into public.jobs
    (shop_id, client_id, quotation_id, number, title, stage,
     promised_date, total_amount, created_by)
  values
    (q.shop_id, q.client_id, q.id, v_job_no, v_title, p_starting_stage,
     p_promised_date, q.total, v_uid)
  returning id into v_job_id;

  insert into public.job_stage_events (job_id, from_stage, to_stage, note, by)
  values (v_job_id, null, p_starting_stage,
          'Created from quotation ' || coalesce(q.number, q.id::text), v_uid);

  if coalesce(p_advance_amount, 0) > 0 then
    v_receipt := public.next_document_number(q.shop_id, 'receipt');
    insert into public.payments
      (shop_id, client_id, job_id, kind, amount, mode, received_at, receipt_number, note, created_by)
    values
      (q.shop_id, q.client_id, v_job_id, 'advance', p_advance_amount, p_advance_mode,
       now(), v_receipt, 'Advance recorded at job creation', v_uid);
  end if;

  -- close any open follow-up tied to this quotation
  update public.follow_ups
  set status = 'done', completed_at = now()
  where shop_id = q.shop_id
    and related_type = 'quotation'
    and related_id = q.id
    and status in ('open','snoozed');

  -- schedule the delivery follow-up
  if p_promised_date is not null then
    insert into public.follow_ups
      (shop_id, client_id, related_type, related_id, title, context, due_date, created_by)
    values
      (q.shop_id, q.client_id, 'job', v_job_id, 'Delivery aaj hai',
       v_title || ' — delivery ' || to_char(p_promised_date, 'DD Mon'),
       p_promised_date, v_uid);
  end if;

  return v_job_id;
end;
$$;

-- ===========================================================================
-- Automatic follow-up triggers (§6.5)
-- ===========================================================================

-- Quotation marked 'sent' -> stamp sent_at + follow-up at sent_at + 3 days
create or replace function public.tg_quotation_sent()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'sent' and new.status is distinct from old.status then
    if new.sent_at is null then
      new.sent_at := now();
    end if;
  end if;
  return new;
end;
$$;
create trigger trg_quotation_sent_before
  before update on public.quotations
  for each row execute function public.tg_quotation_sent();

create or replace function public.tg_quotation_sent_followup()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'sent' and new.status is distinct from old.status then
    insert into public.follow_ups
      (shop_id, client_id, related_type, related_id, title, context, due_date, created_by)
    values
      (new.shop_id, new.client_id, 'quotation', new.id,
       'Quotation ka follow-up',
       coalesce(new.number, 'Quotation') || ' — total ' || trim(to_char(new.total, 'FM999999990')),
       ((coalesce(new.sent_at, now())) at time zone 'Asia/Kolkata')::date + 3,
       new.created_by);
  end if;
  return null;
end;
$$;
create trigger trg_quotation_sent_after
  after update on public.quotations
  for each row execute function public.tg_quotation_sent_followup();

-- Job stage transitions -> approval / delivered follow-ups; stamp delivered_at
create or replace function public.tg_job_stage_before()
returns trigger
language plpgsql
as $$
begin
  if new.stage = 'delivered' and new.stage is distinct from old.stage then
    if new.delivered_at is null then
      new.delivered_at := now();
    end if;
  end if;
  return new;
end;
$$;
create trigger trg_job_stage_before
  before update on public.jobs
  for each row execute function public.tg_job_stage_before();

create or replace function public.tg_job_stage_followup()
returns trigger
language plpgsql
as $$
declare
  v_today   date := (now() at time zone 'Asia/Kolkata')::date;
  v_balance numeric(12,2);
begin
  if new.stage is not distinct from old.stage then
    return null;
  end if;

  if new.stage = 'approval' then
    insert into public.follow_ups
      (shop_id, client_id, related_type, related_id, title, context, due_date)
    values
      (new.shop_id, new.client_id, 'job', new.id,
       'Approval pending — kaam ruka hua hai',
       coalesce(new.title, 'Job'), v_today + 2);
  end if;

  if new.stage = 'delivered' then
    select new.total_amount - coalesce(sum(p.amount), 0)
    into v_balance
    from public.payments p
    where p.job_id = new.id;

    if coalesce(v_balance, 0) > 0 then
      insert into public.follow_ups
        (shop_id, client_id, related_type, related_id, title, context, due_date)
      values
        (new.shop_id, new.client_id, 'job', new.id,
         'Payment reminder',
         coalesce(new.title, 'Job') || ' — baaki ' || trim(to_char(v_balance, 'FM999999990')),
         v_today + 7);
    end if;
  end if;

  return null;
end;
$$;
create trigger trg_job_stage_after
  after update on public.jobs
  for each row execute function public.tg_job_stage_followup();

-- ---------------------------------------------------------------------------
-- Grants — the app calls these two by RPC as the authenticated user.
-- ---------------------------------------------------------------------------
revoke execute on function public.next_document_number(uuid, text) from public, anon;
grant  execute on function public.next_document_number(uuid, text) to authenticated;

revoke execute on function public.convert_quotation_to_job(uuid, date, text, numeric, text) from public, anon;
grant  execute on function public.convert_quotation_to_job(uuid, date, text, numeric, text) to authenticated;

grant execute on function public.fy_code(date) to authenticated, anon;
grant execute on function public.auth_shop_id() to authenticated;
