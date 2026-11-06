-- Extend the staff question bank for structured exam content and worked solutions.
-- Apply this migration in Supabase before using the extended question import/editor.
alter table public.upec_teacher_questions
 add column if not exists question_type text not null default 'single_choice'
   check (question_type in ('single_choice','multiple_select','true_false','short_answer','numeric')),
 add column if not exists topic text not null default '',
 add column if not exists subtopic text not null default '',
 add column if not exists difficulty text not null default 'medium'
   check (difficulty in ('easy','medium','hard')),
 add column if not exists exam_type text not null default '',
 add column if not exists exam_year integer,
 add column if not exists solution_steps text not null default '',
 add column if not exists source_name text not null default '',
 add column if not exists source_reference text not null default '',
 add column if not exists source_license text not null default '';

create index if not exists upec_teacher_questions_exam_filter_idx
 on public.upec_teacher_questions(subject_id,exam_type,exam_year,status);
