-- Eligibility guard for the existing assessment start RPC.
create or replace function public.upec_begin_assessment(p_assessment uuid,p_student uuid)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare exam public.upec_assessments%rowtype; attempt uuid;
begin
 select * into exam from public.upec_assessments where id=p_assessment and status='published';
 if not found or (exam.opens_at is not null and now()<exam.opens_at)
 or (exam.closes_at is not null and now()>=exam.closes_at) then
  raise exception 'Assessment unavailable' using errcode='P0002';
 end if;
 if exam.restricted and not exists
  (select 1 from public.upec_assessment_eligibility
   where assessment_id=p_assessment and student_account_id=p_student) then
  raise exception 'Not eligible' using errcode='42501';
 end if;
 insert into public.upec_assessment_attempts(assessment_id,student_account_id,expires_at)
 values(p_assessment,p_student,least(now()+make_interval(mins=>exam.duration_minutes),
 coalesce(exam.closes_at,'infinity'::timestamptz)))
 on conflict(assessment_id,student_account_id) do nothing returning id into attempt;
 if attempt is null then
  select id into attempt from public.upec_assessment_attempts
  where assessment_id=p_assessment and student_account_id=p_student;
 end if;
 return attempt;
end $$;
revoke all on function public.upec_begin_assessment(uuid,uuid) from public,anon,authenticated;
grant execute on function public.upec_begin_assessment(uuid,uuid) to service_role;
