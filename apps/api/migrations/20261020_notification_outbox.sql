-- Durable notification email outbox with atomic worker claims.
create table if not exists public.upec_email_outbox (
 id uuid primary key default gen_random_uuid(),
 dedupe_key text not null unique,
 recipient text not null,
 subject text not null,
 body text not null,
 status text not null default 'pending' check(status in ('pending','sending','sent','failed')),
 attempts integer not null default 0,
 next_attempt_at timestamptz not null default now(),
 claimed_until timestamptz,
 last_error text,
 created_at timestamptz not null default now(),
 sent_at timestamptz
);
create index if not exists upec_email_outbox_due_idx on public.upec_email_outbox(status,next_attempt_at);
alter table public.upec_email_outbox enable row level security;
revoke all on public.upec_email_outbox from anon,authenticated;

create or replace function public.upec_claim_notification_emails(p_limit integer default 10)
returns setof public.upec_email_outbox language plpgsql security definer set search_path=public,pg_temp as $$
begin
 return query
 with chosen as (
  select id from public.upec_email_outbox
  where ((status='pending' and next_attempt_at<=now())
      or (status='sending' and claimed_until<now()))
    and attempts<5
  order by next_attempt_at,id
  for update skip locked
  limit least(greatest(p_limit,1),20)
 )
 update public.upec_email_outbox o set status='sending',
   attempts=o.attempts+1,claimed_until=now()+interval '5 minutes'
 from chosen where o.id=chosen.id
 returning o.*;
end $$;
revoke all on function public.upec_claim_notification_emails(integer) from public,anon,authenticated;
grant execute on function public.upec_claim_notification_emails(integer) to service_role;
