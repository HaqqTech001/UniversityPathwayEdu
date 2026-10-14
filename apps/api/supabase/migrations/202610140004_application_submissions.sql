alter table public.applications add column if not exists form_data jsonb not null default '{}'::jsonb;
alter table public.applications alter column reference_number set default ('UPEC-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)));
create policy "applications_insert_own_draft" on public.applications for insert to authenticated
with check (student_id = (select auth.uid()) and status = 'draft');
create policy "applications_update_own_draft" on public.applications for update to authenticated
using (student_id = (select auth.uid()) and status = 'draft')
with check (student_id = (select auth.uid()) and status in ('draft','submitted'));
revoke update on public.applications from authenticated;
grant update (form_data, programme, academic_session, study_centre, subjects, submitted_at) on public.applications to authenticated;
create or replace function public.submit_upec_application(p_application_id uuid)
returns public.applications language plpgsql security definer set search_path = ''
as $$
declare v_app public.applications;
begin
 if (select auth.uid()) is null then raise exception 'Not authenticated'; end if;
 update public.applications set status='submitted',submitted_at=now()
 where id=p_application_id and student_id=(select auth.uid()) and status='draft'
 returning * into v_app;
 if v_app.id is null then raise exception 'Draft not found or already submitted'; end if;
 return v_app;
end;
$$;
revoke all on function public.submit_upec_application(uuid) from public,anon;
grant execute on function public.submit_upec_application(uuid) to authenticated;
