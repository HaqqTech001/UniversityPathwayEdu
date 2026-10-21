create table if not exists public.upec_subject_combinations (
 id uuid primary key default gen_random_uuid(),
 programme_id uuid not null references public.upec_academic_programmes(id) on delete cascade,
 name text not null check (length(trim(name)) between 3 and 160),
 subject_codes text[] not null check (cardinality(subject_codes) between 1 and 8),
 active boolean not null default true,
 created_at timestamptz not null default now(),
 unique(programme_id,name)
);
alter table public.upec_subject_combinations enable row level security;
revoke all on public.upec_subject_combinations from anon,authenticated;