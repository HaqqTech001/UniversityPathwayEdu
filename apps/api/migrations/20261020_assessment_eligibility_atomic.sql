-- Atomic eligibility replacement for draft assessments.
create or replace function public.upec_set_assessment_eligibility(
 p_assessment uuid,p_restricted boolean,p_students uuid[])
returns integer language plpgsql security definer set search_path=public,pg_temp as $$
declare v_status text; v_count integer;
begin
 if p_restricted is null or p_students is null or cardinality(p_students)>100
 or (select count(distinct x) from unnest(p_students) x)<>cardinality(p_students) then
  raise exception 'Invalid student list' using errcode='22023';
 end if;
 select status into v_status from public.upec_assessments where id=p_assessment for update;
 if not found then raise exception 'Assessment not found' using errcode='P0002'; end if;
 if v_status<>'draft' then raise exception 'Only drafts can be assigned' using errcode='22023'; end if;
 if exists(select 1 from unnest(p_students) s
   left join public.local_accounts a on a.id=s
   where s is null or a.id is null or a.verified_at is null) then
  raise exception 'An assigned student account is invalid or unverified' using errcode='22023';
 end if;
 delete from public.upec_assessment_eligibility where assessment_id=p_assessment;
 insert into public.upec_assessment_eligibility(assessment_id,student_account_id)
 select p_assessment,s from unnest(p_students) s;
 update public.upec_assessments set restricted=p_restricted where id=p_assessment;
 v_count:=cardinality(p_students);
 return v_count;
end $$;
revoke all on function public.upec_set_assessment_eligibility(uuid,boolean,uuid[]) from public,anon,authenticated;
grant execute on function public.upec_set_assessment_eligibility(uuid,boolean,uuid[]) to service_role;
