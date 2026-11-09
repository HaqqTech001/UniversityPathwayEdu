alter table public.upec_jamb_programmes
 add column if not exists olevel_requirements jsonb not null default '{"requiredSubjects":[],"subjectGroups":[]}'::jsonb,
 add column if not exists direct_entry_requirements jsonb not null default '{"requiredSubjects":[],"subjectGroups":[],"acceptedQualifications":[]}'::jsonb,
 add column if not exists entry_requirements_source_reference text,
 add column if not exists entry_requirements_source_verified boolean not null default false,
 add column if not exists entry_requirements_source_checked_at timestamptz,
 add column if not exists entry_requirements_verification_notes text not null default '';
create index if not exists upec_jamb_programmes_entry_verified_idx
 on public.upec_jamb_programmes(exam_year,entry_requirements_source_verified)
 where active=true;
comment on column public.upec_jamb_programmes.olevel_requirements is 'Programme-specific UTME entry O-Level requirements, kept separate from UTME subject combinations.';
comment on column public.upec_jamb_programmes.direct_entry_requirements is 'Programme-specific Direct Entry/A-Level requirements; not used as UTME subject combinations.';
comment on column public.upec_jamb_programmes.entry_requirements_source_verified is 'Independent verification status for O-Level and Direct Entry requirements; does not imply UTME combination verification.';
