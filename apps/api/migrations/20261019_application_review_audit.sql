-- Server-side audit of every admissions status transition.
create table if not exists public.local_application_reviews (
 id uuid primary key default gen_random_uuid(),
 application_id uuid not null references public.local_student_applications(id) on delete cascade,
 reviewer_account_id uuid not null references public.local_accounts(id),
 previous_status text not null,
 new_status text not null check (new_status in ('under_review','approved','action_required','rejected')),
 note text,
 created_at timestamptz not null default now()
);
create index if not exists local_application_reviews_application_idx on public.local_application_reviews(application_id,created_at desc);
alter table public.local_application_reviews enable row level security;
-- Only trusted server-side service-role operations can write these records.
