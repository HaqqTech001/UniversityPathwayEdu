-- UPEC academic catalogue foundation. Apply in Supabase SQL editor before enabling academic screens.
create table if not exists public.upec_academic_programmes (
 id uuid primary key default gen_random_uuid(),
 code text not null unique check (code ~ '^[A-Z0-9_-]{2,32}$'),
 name text not null check(length(trim(name)) between 3 and 160),
 description text not null default '',
 active boolean not null default true,
 created_at timestamptz not null default now()
);
create table if not exists public.upec_academic_subjects (
 id uuid primary key default gen_random_uuid(),
 programme_id uuid not null references public.upec_academic_programmes(id) on delete restrict,
 code text not null check(code ~ '^[A-Z0-9_-]{2,32}$'),
 name text not null check(length(trim(name)) between 2 and 160),
 active boolean not null default true,
 created_at timestamptz not null default now(),
 unique(programme_id,code)
);
create index if not exists upec_subjects_programme_idx on public.upec_academic_subjects(programme_id);
alter table public.upec_academic_programmes enable row level security;
alter table public.upec_academic_subjects enable row level security;
-- No client-facing RLS policies: trusted API uses the server-side service role.
revoke all on public.upec_academic_programmes,public.upec_academic_subjects from anon,authenticated;
