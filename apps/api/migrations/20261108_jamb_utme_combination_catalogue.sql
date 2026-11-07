-- JAMB UTME options and institution/programme-specific combination rules.
-- JAMB's IBASS checker preselects English Language and requires institution + programme.
-- No course combinations are seeded until checked against the applicable official IBASS record.
alter table public.upec_exam_subject_catalogue
  drop constraint if exists upec_exam_subject_catalogue_selection_type_check;
alter table public.upec_exam_subject_catalogue
  add constraint upec_exam_subject_catalogue_selection_type_check
  check(selection_type in ('compulsory','required_choice','departmental_core','departmental_optional','outside_field_elective','programme_required','institution_specific','catalogue_option'));

create table if not exists public.upec_jamb_utme_combinations (
 id uuid primary key default gen_random_uuid(),
 exam_year integer not null check(exam_year between 2026 and 2100),
 institution_name text not null check(length(trim(institution_name)) between 2 and 180),
 institution_code text,
 programme_name text not null check(length(trim(programme_name)) between 2 and 180),
 programme_code text,
 english_language_required boolean not null default true check(english_language_required),
 required_subjects text[] not null default '{}',
 alternative_subjects text[] not null default '{}',
 alternative_subject_count integer not null default 0 check(alternative_subject_count between 0 and 3),
 subject_group_rules jsonb not null default '[]'::jsonb check(jsonb_typeof(subject_group_rules)='array'),
 additional_notes text not null default '',
 source_reference text not null check(length(trim(source_reference)) between 8 and 500),
 source_verified boolean not null default false,
 active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint upec_jamb_utme_three_subjects_check
   check(cardinality(required_subjects)+alternative_subject_count=3),
 constraint upec_jamb_utme_alternative_count_check
   check((alternative_subject_count=0 and cardinality(alternative_subjects)=0) or (alternative_subject_count>0 and cardinality(alternative_subjects)>=alternative_subject_count)),
 constraint upec_jamb_utme_required_unique_check
   check(cardinality(required_subjects)=cardinality(array(select distinct unnest(required_subjects)))),
 constraint upec_jamb_utme_alternative_unique_check
   check(cardinality(alternative_subjects)=cardinality(array(select distinct unnest(alternative_subjects))))
);
create unique index if not exists upec_jamb_utme_combo_unique_idx
 on public.upec_jamb_utme_combinations(exam_year,lower(institution_name),lower(programme_name));
create index if not exists upec_jamb_utme_combo_lookup_idx
 on public.upec_jamb_utme_combinations(exam_year,lower(institution_name),active);
alter table public.upec_jamb_utme_combinations enable row level security;
revoke all on public.upec_jamb_utme_combinations from anon,authenticated;

-- IBASS currently exposes the selectable UTME subject list and preselects English Language.
-- These records describe available options, NOT programme combinations.
with subjects(name,family,category,selection,reference) as (
 values
 ('English Language','language','language','compulsory','https://eligibility.jamb.gov.ng/'),
 ('Agriculture','science','science','catalogue_option','https://eligibility.jamb.gov.ng/'),
 ('Arabic','language','language','catalogue_option','https://eligibility.jamb.gov.ng/'),
 ('Art','humanities','humanities','catalogue_option','https://eligibility.jamb.gov.ng/'),
 ('Biology','science','science','catalogue_option','https://eligibility.jamb.gov.ng/'),
 ('Chemistry','science','science','catalogue_option','https://eligibility.jamb.gov.ng/'),
 ('Christian Religious Studies','humanities','humanities','catalogue_option','https://eligibility.jamb.gov.ng/'),
 ('Commerce','business','business_studies','catalogue_option','https://eligibility.jamb.gov.ng/'),
 ('Economics','business','business_studies','catalogue_option','https://eligibility.jamb.gov.ng/'),
 ('French','language','language','catalogue_option','https://eligibility.jamb.gov.ng/'),
 ('Geography','humanities','humanities','catalogue_option','https://eligibility.jamb.gov.ng/'),
 ('Government','humanities','humanities','catalogue_option','https://eligibility.jamb.gov.ng/'),
 ('Hausa Language','language','language','catalogue_option','https://eligibility.jamb.gov.ng/'),
 ('History','humanities','humanities','catalogue_option','https://eligibility.jamb.gov.ng/'),
 ('Home Economics','vocational','vocational','catalogue_option','https://eligibility.jamb.gov.ng/'),
 ('Igbo Language','language','language','catalogue_option','https://eligibility.jamb.gov.ng/'),
 ('Islamic Religious Studies','humanities','humanities','catalogue_option','https://eligibility.jamb.gov.ng/'),
 ('Literature in English','humanities','humanities','catalogue_option','https://eligibility.jamb.gov.ng/'),
 ('Mathematics','mathematics','mathematics','catalogue_option','https://eligibility.jamb.gov.ng/'),
 ('Music','humanities','humanities','catalogue_option','https://eligibility.jamb.gov.ng/'),
 ('Physics','science','science','catalogue_option','https://eligibility.jamb.gov.ng/'),
 ('Principles of Accounts','business','business_studies','catalogue_option','https://eligibility.jamb.gov.ng/'),
 ('Yoruba Language','language','language','catalogue_option','https://eligibility.jamb.gov.ng/')
), library as (
 insert into public.upec_subject_library(canonical_name,subject_family)
 select name,family from subjects
 on conflict(normalized_name) do update set canonical_name=excluded.canonical_name,subject_family=excluded.subject_family,updated_at=now()
 returning id,canonical_name
)
insert into public.upec_exam_subject_catalogue(
 exam_type,exam_year,subject_id,field_of_study,subject_category,selection_type,
 source_reference,source_verified,active
)
select 'jamb_utme',2027,l.id,'general',s.category,s.selection,s.reference,true,true
from subjects s join public.upec_subject_library l
 on l.normalized_name=lower(regexp_replace(trim(s.name),'\\s+',' ','g'))
on conflict do nothing;
