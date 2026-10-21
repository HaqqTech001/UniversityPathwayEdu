-- Official external examination registrations are distinct from UPEC programme applications.
-- Numbers entered here must come from the examination authority's official process.
create table if not exists public.upec_exam_registrations (
 id uuid primary key default gen_random_uuid(),
 student_account_id uuid not null references public.local_accounts(id),
 exam_body text not null check (exam_body in ('JAMB','WAEC','IJMB')),
 exam_year integer not null check (exam_year between 2020 and 2100),
 registration_number text not null check (length(trim(registration_number)) between 4 and 100),
 examination_number text,
 centre_name text,
 exam_date date,
 status text not null default 'pending_verification' check(status in ('pending_verification','verified')),
 recorded_by uuid not null references public.local_accounts(id),
 verified_by uuid references public.local_accounts(id),
 verified_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(exam_body,exam_year,registration_number),
 check(status <> 'verified' or (verified_by is not null and verified_at is not null))
);
create index if not exists upec_exam_registrations_student_idx on public.upec_exam_registrations(student_account_id,exam_year desc);
alter table public.upec_exam_registrations enable row level security;
revoke all on public.upec_exam_registrations from anon,authenticated;
