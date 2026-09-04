-- ============================================================================
-- The Infinity Art — 04 reporting views
-- security_invoker = true so the caller's RLS on the base tables still applies.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- job_financials — per job: total / received / balance
-- ---------------------------------------------------------------------------
create or replace view public.job_financials
with (security_invoker = true) as
select
  j.id                                        as job_id,
  j.shop_id                                   as shop_id,
  j.client_id                                 as client_id,
  j.total_amount                              as total_amount,
  coalesce(sum(p.amount), 0)::numeric(12,2)   as received,
  (j.total_amount - coalesce(sum(p.amount), 0))::numeric(12,2) as balance
from public.jobs j
left join public.payments p on p.job_id = j.id
group by j.id, j.shop_id, j.client_id, j.total_amount;

-- ---------------------------------------------------------------------------
-- client_balances — per client: billed / received / balance / ageing
--   total_billed   = sum of non-cancelled jobs.total_amount
--   total_received = sum of ALL payments for the client (incl. bare advances,
--                    which is why balance can legitimately go negative)
--   ageing clock   = starts at jobs.delivered_at (D6); undelivered balances
--                    do not age and never surface in "Paisa baaki"
-- ---------------------------------------------------------------------------
create or replace view public.client_balances
with (security_invoker = true) as
select
  c.id      as client_id,
  c.shop_id as shop_id,
  coalesce(jb.total_billed, 0)::numeric(12,2)   as total_billed,
  coalesce(pm.total_received, 0)::numeric(12,2) as total_received,
  (coalesce(jb.total_billed, 0) - coalesce(pm.total_received, 0))::numeric(12,2) as balance,
  jb.oldest_unpaid_delivered_at,
  case
    when jb.oldest_unpaid_delivered_at is not null
    then greatest(
           0,
           ((now() at time zone 'Asia/Kolkata')::date
             - (jb.oldest_unpaid_delivered_at at time zone 'Asia/Kolkata')::date)
         )
    else null
  end as days_outstanding
from public.clients c
left join lateral (
  select
    sum(j.total_amount) as total_billed,
    min(j.delivered_at) filter (
      where j.delivered_at is not null and jf.balance > 0
    ) as oldest_unpaid_delivered_at
  from public.jobs j
  left join public.job_financials jf on jf.job_id = j.id
  where j.client_id = c.id
    and j.stage <> 'cancelled'
) jb on true
left join lateral (
  select sum(p.amount) as total_received
  from public.payments p
  where p.client_id = c.id
) pm on true;
