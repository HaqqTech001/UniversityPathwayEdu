create table if not exists public.local_student_biodata (
 account_id uuid primary key references public.local_accounts(id) on delete cascade,
 details jsonb not null default '{}'::jsonb,
 completed_at timestamptz,
 updated_at timestamptz not null default now()
);
create table if not exists public.local_student_applications (
 id uuid primary key default gen_random_uuid(),
 account_id uuid not null references public.local_accounts(id) on delete cascade,
 reference_number text unique not null default ('UPEC-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))),
 programme text not null,
 academic_session text not null,
 subjects jsonb not null default '[]'::jsonb,
 form_data jsonb not null default '{}'::jsonb,
 status text not null default 'submitted' check(status in ('draft','submitted','under_review','approved','action_required')),
 submitted_at timestamptz not null default now(),
 created_at timestamptz not null default now()
);
create index if not exists local_student_applications_account_idx on public.local_student_applications(account_id,created_at desc);
alter table public.local_student_biodata enable row level security;
alter table public.local_student_applications enable row level security;
revoke all on public.local_student_biodata, public.local_student_applications from anon,authenticated;
