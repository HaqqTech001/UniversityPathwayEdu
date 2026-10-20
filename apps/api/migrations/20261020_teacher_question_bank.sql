-- Staff-authored questions: not historical JAMB questions.
create table if not exists public.upec_teacher_questions (
 id uuid primary key default gen_random_uuid(),
 subject_id uuid not null references public.upec_academic_subjects(id) on delete restrict,
 author_account_id uuid not null references public.local_accounts(id),
 prompt text not null check(length(trim(prompt)) between 10 and 5000),
 options jsonb not null,
 correct_option text not null check(correct_option in ('A','B','C','D')),
 explanation text not null default '',
 status text not null default 'draft' check(status in ('draft','published')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint upec_teacher_question_options_check check (
  jsonb_typeof(options)='object' and options ?& array['A','B','C','D']
 )
);
create index if not exists upec_teacher_questions_subject_idx on public.upec_teacher_questions(subject_id,status);
alter table public.upec_teacher_questions enable row level security;
revoke all on public.upec_teacher_questions from anon,authenticated;
