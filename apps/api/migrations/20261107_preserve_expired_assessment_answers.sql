-- Preserve answers already saved by a candidate when an institutional assessment expires.
-- The API invokes this function with the authenticated student's account ID.
create or replace function public.upec_finalize_expired_attempts(p_student uuid)
returns integer
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare affected integer;
begin
 update public.upec_assessment_attempts a
 set submitted_at=a.expires_at,
     score=coalesce((
       select count(*)::integer
       from public.upec_assessment_questions aq
       join public.upec_teacher_questions q on q.id=aq.question_id
       where aq.assessment_id=a.assessment_id
         and coalesce(a.answers,'{}'::jsonb)->>q.id::text=q.correct_option
     ),0),
     total_questions=coalesce((
       select count(*)::integer
       from public.upec_assessment_questions aq
       where aq.assessment_id=a.assessment_id
     ),0)
 where a.student_account_id=p_student
   and a.submitted_at is null
   and a.expires_at < now() - interval '30 seconds';
 get diagnostics affected=row_count;
 return affected;
end
$function$;
