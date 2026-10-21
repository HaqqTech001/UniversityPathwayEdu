-- One private student/staff support conversation per student.
create table if not exists public.upec_support_messages (
 id uuid primary key default gen_random_uuid(),
 student_account_id uuid not null references public.local_accounts(id) on delete cascade,
 author_account_id uuid not null references public.local_accounts(id) on delete restrict,
 author_role text not null check(author_role in ('student','staff')),
 body text not null check(length(trim(body)) between 1 and 3000),
 created_at timestamptz not null default now()
);
create index if not exists upec_support_student_idx on public.upec_support_messages(student_account_id,created_at desc);
alter table public.upec_support_messages enable row level security;
revoke all on public.upec_support_messages from anon,authenticated;
