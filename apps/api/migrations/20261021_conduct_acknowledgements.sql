create table if not exists public.upec_student_conduct_acceptances (
 student_account_id uuid not null references public.local_accounts(id) on delete cascade,
 policy_version text not null,
 accepted_at timestamptz not null default now(),
 primary key(student_account_id,policy_version)
);
alter table public.upec_student_conduct_acceptances enable row level security;
revoke all on public.upec_student_conduct_acceptances from anon,authenticated;
