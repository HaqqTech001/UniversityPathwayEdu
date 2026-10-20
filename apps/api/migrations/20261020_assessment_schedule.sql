-- Scheduling and result history; run after assessment/attempt migrations.
alter table public.upec_assessments
 add column if not exists opens_at timestamptz,
 add column if not exists closes_at timestamptz;
alter table public.upec_assessments
 drop constraint if exists upec_assessment_window_check;
alter table public.upec_assessments
 add constraint upec_assessment_window_check check (opens_at is null or closes_at is null or closes_at>opens_at);

-- Replace start RPC: enforce window atomically inside the database.
create or replace function public.upec_begin_assessment(p_assessment uuid,p_student uuid)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare v_exam public.upec_assessments%rowtype; v_attempt uuid;
begin
 select * into v_exam from public.upec_assessments where id=p_assessment and status='published';
 if not found or (v_exam.opens_at is not null and now()<v_exam.opens_at)
 or (v_exam.closes_at is not null and now()>=v_exam.closes_at) then
  raise exception 'Assessment not currently available' using errcode='P0002';
 end if;
 insert into public.upec_assessment_attempts(assessment_id,student_account_id,expires_at)
 values(p_assessment,p_student,
  least(now()+make_interval(mins=>v_exam.duration_minutes),coalesce(v_exam.closes_at,'infinity'::timestamptz)))
 on conflict(assessment_id,student_account_id) do nothing returning id into v_attempt;
 if v_attempt is null then
  select id into v_attempt from public.upec_assessment_attempts
  where assessment_id=p_assessment and student_account_id=p_student;
 end if;
 return v_attempt;
end $$;
revoke all on function public.upec_begin_assessment(uuid,uuid) from public,anon,authenticated;
grant execute on function public.upec_begin_assessment(uuid,uuid) to service_role;
