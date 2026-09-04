-- Quick post-`db reset` sanity check. Run:
--   psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f scripts/smoke.sql
\echo == row counts ==
select 'shops' t, count(*) from public.shops
union all select 'services', count(*) from public.services
union all select 'clients', count(*) from public.clients
union all select 'interactions', count(*) from public.interactions
union all select 'quotations', count(*) from public.quotations
union all select 'quotation_items', count(*) from public.quotation_items
union all select 'jobs', count(*) from public.jobs
union all select 'job_stage_events', count(*) from public.job_stage_events
union all select 'payments', count(*) from public.payments
union all select 'follow_ups', count(*) from public.follow_ups
order by 1;

\echo == quotation statuses (expect draft, sent x2, followup, won, lost) ==
select status, count(*) from public.quotations group by status order by status;

\echo == job stages (expect every stage incl 2 late non-delivered) ==
select stage, count(*) from public.jobs group by stage order by stage;

\echo == open follow-ups, oldest first (expect 5, 2 overdue) ==
select title, due_date,
       due_date <= (now() at time zone 'Asia/Kolkata')::date as due_or_overdue
from public.follow_ups where status = 'open' order by due_date;

\echo == client_balances: receivables that hit Aaj Ka Kaam (balance>0 AND days_outstanding>=7) ==
select c.name, b.total_billed, b.total_received, b.balance, b.days_outstanding
from public.client_balances b join public.clients c on c.id = b.client_id
where b.balance > 0 and b.days_outstanding >= 7
order by b.days_outstanding desc;

\echo == ageing buckets present (expect one row each: 0-15, 16-30, 30+) ==
select case when days_outstanding <= 15 then '0-15'
            when days_outstanding <= 30 then '16-30'
            else '30+' end as bucket,
       count(*)
from public.client_balances
where balance > 0 and days_outstanding >= 7
group by 1 order by 1;

\echo == numbering: two rapid calls never collide ==
select public.next_document_number('11111111-1111-1111-1111-111111111111','quotation') as a,
       public.next_document_number('11111111-1111-1111-1111-111111111111','quotation') as b;
