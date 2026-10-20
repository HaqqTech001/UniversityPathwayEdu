-- Restrict selected assessments to explicitly assigned student accounts.
alter table public.upec_assessments add column if not exists restricted boolean not null default false;
create table if not exists public.upec_assessment_eligibility (
 assessment_id uuid not null references public.upec_assessments(id) on delete cascade,
 student_account_id uuid not null references public.local_accounts(id) on delete cascade,
 assigned_at timestamptz not null default now(),
 primary key (assessment_id,student_account_id)
);
alter table public.upec_assessment_eligibility enable row level security;
revoke all on public.upec_assessment_eligibility from anon, authenticated;
