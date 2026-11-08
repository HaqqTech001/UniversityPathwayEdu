alter table public.upec_jamb_utme_combinations
 add column if not exists source_checked_at timestamptz,
 add column if not exists source_verified_by uuid,
 add column if not exists verification_notes text not null default '',
 add column if not exists verified_required_subjects text[] not null default '{}',
 add column if not exists verified_alternative_subjects text[] not null default '{}';

alter table public.upec_jamb_utme_combinations
 drop constraint if exists upec_jamb_verification_evidence_check;
alter table public.upec_jamb_utme_combinations
 add constraint upec_jamb_verification_evidence_check check (
  (source_verified=false and source_checked_at is null and source_verified_by is null)
  or
  (source_verified=true and source_checked_at is not null and source_verified_by is not null
   and length(trim(verification_notes))>=20
   and cardinality(verified_required_subjects)+alternative_subject_count=3
   and verified_required_subjects=required_subjects
   and verified_alternative_subjects=alternative_subjects)
 );

create index if not exists upec_jamb_combo_verified_idx
 on public.upec_jamb_utme_combinations(exam_year,source_verified,active);
