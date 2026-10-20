-- Finalize overdue institutional CBT attempts with no unsaved answers.
-- The server has no durable answer autosave yet; never invent recovered responses.
create or replace function public.upec_finalize_expired_attempts(p_student uuid)
returns integer language plpgsql security definer set search_path=public,pg_temp as $$
declare affected integer;
begin
 update public.upec_assessment_attempts a
 set submitted_at=a.expires_at, answers='{}'::jsonb,
     score=0,
     total_questions=(select count(*) from public.upec_assessment_questions q
                      where q.assessment_id=a.assessment_id)
 where a.student_account_id=p_student
   and a.submitted_at is null
   and a.expires_at < now() - interval '30 seconds';
 get diagnostics affected=row_count;
 return affected;
end $$;
revoke all on function public.upec_finalize_expired_attempts(uuid) from public,anon,authenticated;
grant execute on function public.upec_finalize_expired_attempts(uuid) to service_role;
