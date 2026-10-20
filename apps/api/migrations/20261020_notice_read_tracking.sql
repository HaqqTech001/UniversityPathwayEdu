-- Per-student read state for published announcements.
create table if not exists public.upec_notice_reads (
 notice_id uuid not null references public.upec_notices(id) on delete cascade,
 student_account_id uuid not null references public.local_accounts(id) on delete cascade,
 read_at timestamptz not null default now(),
 primary key (notice_id,student_account_id)
);
create index if not exists upec_notice_reads_student_idx on public.upec_notice_reads(student_account_id);
alter table public.upec_notice_reads enable row level security;
revoke all on public.upec_notice_reads from anon,authenticated;
