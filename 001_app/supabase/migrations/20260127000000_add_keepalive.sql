-- Migration: keepalive table to prevent database pause on free plan
-- This creates a small table that gets updated every 12 hours via pg_cron

-- 1) Create the keepalive table
create table if not exists public.keepalive (
  id int primary key,
  last_run timestamptz not null default now()
);

-- Insert initial row
insert into public.keepalive (id) values (1)
on conflict (id) do nothing;

-- 2) Schedule cron job to update every 12 hours
-- Note: pg_cron extension must be enabled in Supabase dashboard
select cron.schedule(
  'keepalive_12h',
  '0 */12 * * *',
  $$
  insert into public.keepalive (id, last_run)
  values (1, now())
  on conflict (id) do update
  set last_run = excluded.last_run;
  $$
);
