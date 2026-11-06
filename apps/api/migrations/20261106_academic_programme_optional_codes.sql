-- Programme codes are not part of the Academic Record workflow.
-- Subject course codes are optional generally and required by the API for IJMB subjects.
alter table public.upec_academic_programmes alter column code drop not null;
alter table public.upec_academic_programmes alter column code drop default;
alter table public.upec_academic_programmes drop constraint if exists upec_academic_programmes_code_check;
alter table public.upec_academic_subjects alter column code drop not null;
alter table public.upec_academic_subjects drop constraint if exists upec_academic_subjects_code_check;
