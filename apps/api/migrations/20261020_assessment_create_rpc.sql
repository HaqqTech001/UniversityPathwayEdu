-- Transactional assessment creation. Requires assessment_builder.sql migration first.
create or replace function public.upec_create_assessment(p_author uuid,p_subject uuid,p_title text,p_duration integer,p_questions uuid[])
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare new_id uuid; matched integer;
begin
 if p_title is null or length(trim(p_title)) not between 5 and 160 or p_duration not between 5 and 240
 or p_questions is null or array_length(p_questions,1) not between 1 and 100 then
  raise exception 'Invalid assessment configuration' using errcode='22023';
 end if;
 if (select count(distinct item) from unnest(p_questions) item)<>array_length(p_questions,1) then
  raise exception 'Duplicate questions are not permitted' using errcode='22023';
 end if;
 select count(*) into matched from public.upec_teacher_questions q
 where q.id=any(p_questions) and q.subject_id=p_subject and q.status='published';
 if matched<>array_length(p_questions,1) then
  raise exception 'All questions must be approved and belong to the selected subject' using errcode='23514';
 end if;
 insert into public.upec_assessments(subject_id,title,duration_minutes,created_by)
 values(p_subject,trim(p_title),p_duration,p_author) returning id into new_id;
 insert into public.upec_assessment_questions(assessment_id,question_id,position)
 select new_id,q.id,q.position from unnest(p_questions) with ordinality as q(id,position);
 return new_id;
end $$;
revoke all on function public.upec_create_assessment(uuid,uuid,text,integer,uuid[]) from public,anon,authenticated;
grant execute on function public.upec_create_assessment(uuid,uuid,text,integer,uuid[]) to service_role;
