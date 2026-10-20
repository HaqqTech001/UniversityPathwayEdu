-- Secure institutional CBT attempts. Apply after academic catalogue, question bank,
-- assessment builder, and assessment creation migrations.
create table if not exists public.upec_assessment_attempts (
 id uuid primary key default gen_random_uuid(),
 assessment_id uuid not null references public.upec_assessments(id) on delete restrict,
 student_account_id uuid not null references public.local_accounts(id) on delete restrict,
 started_at timestamptz not null default now(),
 expires_at timestamptz not null,
 submitted_at timestamptz,
 answers jsonb not null default '{}'::jsonb,
 score integer,
 total_questions integer,
 constraint upec_attempt_score_check check (score is null or (score>=0 and score<=total_questions)),
 constraint upec_attempt_unique unique (assessment_id,student_account_id)
);
create index if not exists upec_attempt_student_idx on public.upec_assessment_attempts(student_account_id,started_at desc);
alter table public.upec_assessment_attempts enable row level security;
revoke all on public.upec_assessment_attempts from anon,authenticated;

-- A single transaction protects the clock, one-attempt rule and scoring.
create or replace function public.upec_begin_assessment(p_assessment uuid,p_student uuid)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare v_duration integer; v_attempt uuid;
begin
 select duration_minutes into v_duration from public.upec_assessments
 where id=p_assessment and status='published';
 if not found then raise exception 'Assessment unavailable' using errcode='P0002'; end if;
 insert into public.upec_assessment_attempts(assessment_id,student_account_id,expires_at)
 values(p_assessment,p_student,now()+make_interval(mins=>v_duration))
 on conflict(assessment_id,student_account_id) do nothing
 returning id into v_attempt;
 if v_attempt is null then
  select id into v_attempt from public.upec_assessment_attempts
  where assessment_id=p_assessment and student_account_id=p_student;
 end if;
 return v_attempt;
end $$;

create or replace function public.upec_submit_assessment(p_attempt uuid,p_student uuid,p_answers jsonb)
returns table(attempt_id uuid,correct_count integer,question_count integer,submitted_time timestamptz)
language plpgsql security definer set search_path=public,pg_temp as $$
declare v_attempt public.upec_assessment_attempts%rowtype; v_total integer; v_correct integer; v_sanitized jsonb;
begin
 select * into v_attempt from public.upec_assessment_attempts
 where id=p_attempt and student_account_id=p_student for update;
 if not found then raise exception 'Attempt not found' using errcode='P0002'; end if;
 if v_attempt.submitted_at is not null then
  return query select v_attempt.id,v_attempt.score,v_attempt.total_questions,v_attempt.submitted_at;
  return;
 end if;
 if now()>v_attempt.expires_at+interval '30 seconds' then
  raise exception 'Examination submission deadline passed' using errcode='22023';
 end if;
 if jsonb_typeof(p_answers) is distinct from 'object' or octet_length(p_answers::text)>20000 then
  raise exception 'Invalid answer payload' using errcode='22023';
 end if;
 if exists(select 1 from jsonb_each_text(p_answers) a
           where a.value not in ('A','B','C','D')
           or not exists(select 1 from public.upec_assessment_questions aq
                         where aq.assessment_id=v_attempt.assessment_id and aq.question_id::text=a.key)) then
  raise exception 'Invalid answer selection' using errcode='22023';
 end if;
 select count(*),count(*) filter(where p_answers->>q.id::text=q.correct_option)
 into v_total,v_correct from public.upec_assessment_questions aq
 join public.upec_teacher_questions q on q.id=aq.question_id
 where aq.assessment_id=v_attempt.assessment_id;
 update public.upec_assessment_attempts
 set answers=p_answers,score=v_correct,total_questions=v_total,submitted_at=now()
 where id=p_attempt returning * into v_attempt;
 return query select v_attempt.id,v_attempt.score,v_attempt.total_questions,v_attempt.submitted_at;
end $$;

revoke all on function public.upec_begin_assessment(uuid,uuid) from public,anon,authenticated;
revoke all on function public.upec_submit_assessment(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.upec_begin_assessment(uuid,uuid) to service_role;
grant execute on function public.upec_submit_assessment(uuid,uuid,jsonb) to service_role;
