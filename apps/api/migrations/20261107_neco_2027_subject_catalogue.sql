-- Separate NECO's exam subject taxonomy from UPEC programme/course subjects.
-- Seed only after the official 2027 subject list and codes have been verified.
create table if not exists public.upec_neco_subject_catalogue (
 id uuid primary key default gen_random_uuid(),
 catalogue_year integer not null default 2027 check(catalogue_year between 2027 and 2100),
 subject_code text not null check(subject_code ~ '^[A-Z0-9_-]{2,16}$'),
 subject_name text not null check(length(trim(subject_name)) between 2 and 160),
 subject_category text not null check(subject_category in (
  'cross_cutting','science_mathematics','technology','humanities','business_studies','trade_entrepreneurship'
 )),
 field_of_study text not null check(field_of_study in ('general','science','arts','commercial','trade')),
 selection_type text not null check(selection_type in (
  'cross_cutting_compulsory','departmental_core','departmental_optional','outside_field_elective'
 )),
 source_reference text not null default 'NECO SSCE Internal 2027',
 source_verified boolean not null default false,
 active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(catalogue_year,subject_code),
 unique(catalogue_year,subject_name)
);
create index if not exists upec_neco_subject_category_idx
 on public.upec_neco_subject_catalogue(catalogue_year,subject_category,field_of_study,active);
create index if not exists upec_neco_subject_selection_idx
 on public.upec_neco_subject_catalogue(catalogue_year,selection_type,field_of_study,active);
alter table public.upec_neco_subject_catalogue enable row level security;
revoke all on public.upec_neco_subject_catalogue from anon,authenticated;
