-- Shared examination subject library and year-specific exam catalogues.
create table if not exists public.upec_subject_library (
 id uuid primary key default gen_random_uuid(),
 canonical_name text not null,
 normalized_name text generated always as (lower(regexp_replace(trim(canonical_name),'\\s+',' ','g'))) stored,
 subject_family text not null default 'general' check(subject_family in ('language','mathematics','science','humanities','business','technology','vocational','general')),
 description text not null default '',
 active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint upec_subject_library_name_check check(length(trim(canonical_name)) between 2 and 160),
 constraint upec_subject_library_normalized_unique unique(normalized_name)
);
create table if not exists public.upec_exam_subject_catalogue (
 id uuid primary key default gen_random_uuid(),
 exam_type text not null check(exam_type in ('jamb_utme','waec_wassce','neco_ssce','ijmb','post_utme')),
 exam_year integer not null check(exam_year between 2026 and 2100),
 subject_id uuid not null references public.upec_subject_library(id) on delete restrict,
 subject_code text,
 field_of_study text not null check(field_of_study in ('general','science','arts','commercial','trade','institution_specific')),
 subject_category text not null check(subject_category in ('language','mathematics','science','humanities','business_studies','technology','vocational','general')),
 selection_type text not null check(selection_type in ('compulsory','departmental_core','departmental_optional','outside_field_elective','programme_required','institution_specific')),
 institution_name text,
 programme_name text,
 source_reference text not null,
 source_verified boolean not null default false,
 active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint upec_exam_subject_code_check check(subject_code is null or subject_code ~ '^[A-Z0-9_-]{2,32}$'),
 constraint upec_exam_subject_source_check check(length(trim(source_reference)) between 3 and 300),
 constraint upec_exam_subject_institution_check check(exam_type <> 'post_utme' or length(trim(coalesce(institution_name,''))) >= 2),
 constraint upec_exam_subject_code_exam_check check((exam_type = 'ijmb' and subject_code is not null) or (exam_type <> 'ijmb' and subject_code is null))
);
create unique index if not exists upec_exam_subject_unique_idx on public.upec_exam_subject_catalogue(exam_type,exam_year,subject_id,coalesce(institution_name,''),coalesce(programme_name,''));
create index if not exists upec_exam_subject_lookup_idx on public.upec_exam_subject_catalogue(exam_type,exam_year,field_of_study,selection_type,active);
create index if not exists upec_exam_subject_subject_idx on public.upec_exam_subject_catalogue(subject_id);
create table if not exists public.upec_exam_selection_rules (
 id uuid primary key default gen_random_uuid(),
 exam_type text not null check(exam_type in ('jamb_utme','waec_wassce','neco_ssce','ijmb','post_utme')),
 exam_year integer not null check(exam_year between 2026 and 2100),
 field_of_study text not null check(field_of_study in ('general','science','arts','commercial','trade','institution_specific')),
 institution_name text,
 programme_name text,
 minimum_subjects integer check(minimum_subjects between 1 and 20),
 maximum_subjects integer check(maximum_subjects between 1 and 20),
 rule_definition jsonb not null default '{}'::jsonb check(jsonb_typeof(rule_definition)='object'),
 source_reference text not null,
 source_verified boolean not null default false,
 active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint upec_exam_rule_subject_range check(minimum_subjects is null or maximum_subjects is null or minimum_subjects <= maximum_subjects)
);
create index if not exists upec_exam_rules_lookup_idx on public.upec_exam_selection_rules(exam_type,exam_year,field_of_study,active);
alter table public.upec_subject_library enable row level security;
alter table public.upec_exam_subject_catalogue enable row level security;
alter table public.upec_exam_selection_rules enable row level security;
revoke all on public.upec_subject_library,public.upec_exam_subject_catalogue,public.upec_exam_selection_rules from anon,authenticated;
