-- User-specific read status for notice board and application update events.
create table if not exists public.upec_notification_reads (
 account_id uuid not null references public.local_accounts(id) on delete cascade,
 notification_key text not null check(length(notification_key) between 3 and 140),
 read_at timestamptz not null default now(),
 primary key(account_id,notification_key)
);
create index if not exists upec_notification_reads_recent_idx on public.upec_notification_reads(account_id,read_at desc);
alter table public.upec_notification_reads enable row level security;
revoke all on public.upec_notification_reads from anon,authenticated;
