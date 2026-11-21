-- Re-apply the full assessment start guard after the scheduling and eligibility
-- migrations. The earlier schedule migration replaced the eligibility-aware RPC.
-- Keep the database authoritative even if a client calls the start endpoint directly.
create or replace function public.upec_begin_assessment(p_assessment uuid,p_student uuid)
returns uuid
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare
 v_exam public.upec_assessments%rowtype;
 v_attempt uuid;
begin
 select * into v_exam
 from public.upec_assessments
 where id=p_assessment
 for share;

 if not found or v_exam.status<>'published'
   or (v_exam.opens_at is not null and now()<v_exam.opens_at)
   or (v_exam.closes_at is not null and now()>=v_exam.closes_at) then
  raise exception 'Assessment not currently available' using errcode='P0002';
 end if;

 if not exists(
  select 1 from public.local_accounts
  where id=p_student and verified_at is not null
 ) or not exists(
  select 1 from public.local_student_applications
  where account_id=p_student and status='approved'
 ) then
  raise exception 'An approved, verified student account is required' using errcode='42501';
 end if;

 if v_exam.restricted and not exists(
  select 1 from public.upec_assessment_eligibility
  where assessment_id=p_assessment and student_account_id=p_student
 ) then
  raise exception 'Not eligible for this assessment' using errcode='42501';
 end if;

 insert into public.upec_assessment_attempts(assessment_id,student_account_id,expires_at)
 values(
  p_assessment,
  p_student,
  least(
   now()+make_interval(mins=>v_exam.duration_minutes),
   coalesce(v_exam.closes_at,'infinity'::timestamptz)
  )
 )
 on conflict(assessment_id,student_account_id) do nothing
 returning id into v_attempt;

 if v_attempt is null then
  select id into v_attempt
  from public.upec_assessment_attempts
  where assessment_id=p_assessment and student_account_id=p_student;
 end if;

 return v_attempt;
end;
$$;

revoke all on function public.upec_begin_assessment(uuid,uuid) from public,anon,authenticated;
grant execute on function public.upec_begin_assessment(uuid,uuid) to service_role;
