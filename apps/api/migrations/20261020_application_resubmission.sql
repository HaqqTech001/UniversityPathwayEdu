-- Apply after local_student_applications. Student resubmissions are atomic and retain the application reference.
create table if not exists public.local_application_resubmissions (
 id uuid primary key default gen_random_uuid(),
 application_id uuid not null references public.local_student_applications(id) on delete cascade,
 student_account_id uuid not null references public.local_accounts(id),
 submitted_at timestamptz not null default now()
);
create index if not exists local_application_resubmissions_app_idx on public.local_application_resubmissions(application_id,submitted_at desc);
alter table public.local_application_resubmissions enable row level security;

create or replace function public.upec_resubmit_application(p_application_id uuid,p_student_id uuid,p_form_data jsonb)
returns table(id uuid,reference_number text,status text) language plpgsql security definer
set search_path = public, pg_temp as $$
declare current_row public.local_student_applications%rowtype;
begin
 if p_form_data is null or jsonb_typeof(p_form_data)<>'object' or octet_length(p_form_data::text)>20000 then
  raise exception 'Invalid application data' using errcode='22023';
 end if;
 select * into current_row from public.local_student_applications
 where local_student_applications.id=p_application_id and account_id=p_student_id for update;
 if not found then raise exception 'Application not found' using errcode='P0002'; end if;
 if current_row.status <> 'action_required' then
  raise exception 'Application not available for correction' using errcode='23514';
 end if;
 -- Programme and academic session are immutable for an existing application.
 if nullif(trim(p_form_data->>'programmeCategory'),'') is distinct from current_row.programme
 or nullif(trim(p_form_data->>'preferredSession'),'') is distinct from current_row.academic_session then
  raise exception 'Programme and session cannot be changed during correction' using errcode='22023';
 end if;
 update public.local_student_applications a
 set form_data=p_form_data,
     subjects=to_jsonb(array_remove(array[
       nullif(trim(p_form_data->>'utmeSubject2'),''),
       nullif(trim(p_form_data->>'utmeSubject3'),''),
       nullif(trim(p_form_data->>'utmeSubject4'),'')],null)),
     status='under_review'
 where a.id=p_application_id;
 insert into public.local_application_resubmissions(application_id,student_account_id)
 values(p_application_id,p_student_id);
 return query select a.id,a.reference_number::text,a.status::text
 from public.local_student_applications a where a.id=p_application_id;
end $$;
revoke all on function public.upec_resubmit_application(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.upec_resubmit_application(uuid,uuid,jsonb) to service_role;
