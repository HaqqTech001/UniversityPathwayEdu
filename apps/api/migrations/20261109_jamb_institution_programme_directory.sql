-- JAMB IBASS institution and programme discovery directory.
-- Directory records remain provisional until checked against the applicable official IBASS brochure entry.
create table if not exists public.upec_jamb_institutions (
 id uuid primary key default gen_random_uuid(),
 institution_name text not null check(length(trim(institution_name)) between 2 and 180),
 institution_type text not null check(institution_type in ('university','polytechnic','college_of_education','monotechnic','other')),
 state_name text,
 official_source_reference text not null check(length(trim(official_source_reference)) between 8 and 500),
 source_verified boolean not null default false,
 source_checked_at timestamptz,
 verification_notes text not null default '',
 active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create unique index if not exists upec_jamb_institutions_name_type_uidx on public.upec_jamb_institutions(lower(institution_name),institution_type);
create table if not exists public.upec_jamb_programmes (
 id uuid primary key default gen_random_uuid(),
 institution_id uuid not null references public.upec_jamb_institutions(id) on delete cascade,
 exam_year integer not null check(exam_year between 2026 and 2100),
 programme_name text not null check(length(trim(programme_name)) between 2 and 180),
 programme_category text,
 official_source_reference text not null check(length(trim(official_source_reference)) between 8 and 500),
 source_verified boolean not null default false,
 source_checked_at timestamptz,
 verification_notes text not null default '',
 active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create unique index if not exists upec_jamb_programmes_inst_year_name_uidx on public.upec_jamb_programmes(institution_id,exam_year,lower(programme_name));
create index if not exists upec_jamb_programmes_lookup_idx on public.upec_jamb_programmes(institution_id,exam_year,lower(programme_name));
alter table public.upec_jamb_institutions enable row level security;
alter table public.upec_jamb_programmes enable row level security;
revoke all on public.upec_jamb_institutions from anon,authenticated;
revoke all on public.upec_jamb_programmes from anon,authenticated;
