-- UPEC institution-authored assessment builder; distinct from licensed JAMB content.
create table if not exists public.upec_assessments (
 id uuid primary key default gen_random_uuid(),
 subject_id uuid not null references public.upec_academic_subjects(id) on delete restrict,
 title text not null check(length(trim(title)) between 5 and 160),
 duration_minutes integer not null check(duration_minutes between 5 and 240),
 status text not null default 'draft' check(status in ('draft','published','closed')),
 created_by uuid not null references public.local_accounts(id),
 created_at timestamptz not null default now()
);
create table if not exists public.upec_assessment_questions (
 assessment_id uuid not null references public.upec_assessments(id) on delete cascade,
 question_id uuid not null references public.upec_teacher_questions(id) on delete restrict,
 position integer not null check(position>0),
 primary key(assessment_id,question_id),
 unique(assessment_id,position)
);
create index if not exists upec_assessment_subject_idx on public.upec_assessments(subject_id,status);
alter table public.upec_assessments enable row level security;
alter table public.upec_assessment_questions enable row level security;
revoke all on public.upec_assessments,public.upec_assessment_questions from anon,authenticated;
