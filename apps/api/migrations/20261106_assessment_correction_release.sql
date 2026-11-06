-- Controlled student correction release for institutional assessments.
alter table public.upec_assessments
 add column if not exists correction_release_mode text not null default 'after_close',
 add column if not exists corrections_release_at timestamptz,
 add column if not exists corrections_released_at timestamptz,
 add column if not exists corrections_released_by uuid references public.local_accounts(id);

alter table public.upec_assessments
 drop constraint if exists upec_assessment_correction_release_mode_check;
alter table public.upec_assessments
 add constraint upec_assessment_correction_release_mode_check
 check (correction_release_mode in ('after_close','scheduled','manual'));

alter table public.upec_assessments
 drop constraint if exists upec_assessment_correction_schedule_check;
alter table public.upec_assessments
 add constraint upec_assessment_correction_schedule_check
 check (
  (correction_release_mode='scheduled' and corrections_release_at is not null)
  or (correction_release_mode<>'scheduled')
 );
