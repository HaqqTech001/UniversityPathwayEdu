-- Support the high-frequency lookups used by student eligibility, assessment question
-- joins/deletes, and teacher-owned Question Bank filtering.
create index if not exists upec_assessment_eligibility_student_idx
 on public.upec_assessment_eligibility(student_account_id);
create index if not exists upec_assessment_questions_question_idx
 on public.upec_assessment_questions(question_id);
create index if not exists upec_teacher_questions_author_idx
 on public.upec_teacher_questions(author_account_id);
