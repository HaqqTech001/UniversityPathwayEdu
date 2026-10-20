-- UPEC student notice board; API service-role access only.
create table if not exists public.upec_notices (
 id uuid primary key default gen_random_uuid(),
 title text not null check(length(trim(title)) between 5 and 180),
 body text not null check(length(trim(body)) between 10 and 6000),
 audience text not null default 'students' check(audience in ('students','everyone')),
 status text not null default 'draft' check(status in ('draft','published')),
 published_at timestamptz,
 created_by uuid not null references public.local_accounts(id),
 created_at timestamptz not null default now()
);
create index if not exists upec_notices_feed_idx on public.upec_notices(status,published_at desc);
alter table public.upec_notices enable row level security;
revoke all on public.upec_notices from anon,authenticated;
