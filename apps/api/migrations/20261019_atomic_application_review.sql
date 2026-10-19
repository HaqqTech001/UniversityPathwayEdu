-- Atomic admissions decision with immutable review history.
-- Accessible only from the trusted API using the Supabase service role.
create or replace function public.upec_review_application(p_application_id uuid,p_reviewer_id uuid,p_status text,p_note text default null)
returns table(id uuid,reference_number text,status text)
language plpgsql security definer set search_path = public
as $$
declare v_old text;v_role text;v_permissions text[];v_ref text;
begin
 select role,permissions into v_role,v_permissions from public.local_staff_members where account_id=p_reviewer_id and active=true;
 if not found or not (v_role in ('super_admin','admin','admissions_officer') or 'applications.review'=any(coalesce(v_permissions,'{}'::text[]))) then raise exception 'Reviewer not authorized' using errcode='42501'; end if;
 if p_status not in ('under_review','approved','action_required','rejected') then raise exception 'Invalid status'; end if;
 if p_status in ('rejected','action_required') and length(trim(coalesce(p_note,'')))<5 then raise exception 'Review reason required'; end if;
 select a.status,a.reference_number into v_old,v_ref from public.local_student_applications a where a.id=p_application_id for update;
 if not found then raise exception 'Application not found'; end if;
 if not ((v_old='submitted' and p_status='under_review') or (v_old='under_review' and p_status in ('approved','action_required','rejected')) or (v_old='action_required' and p_status='under_review')) then raise exception 'Invalid status transition'; end if;
 update public.local_student_applications a set status=p_status where a.id=p_application_id;
 insert into public.local_application_reviews(application_id,reviewer_account_id,previous_status,new_status,note) values(p_application_id,p_reviewer_id,v_old,p_status,nullif(trim(coalesce(p_note,'')),''));
 return query select p_application_id,v_ref,p_status;
end $$;
revoke all on function public.upec_review_application(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.upec_review_application(uuid,uuid,text,text) to service_role;
