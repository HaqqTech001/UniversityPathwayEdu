alter table public.upec_hostel_allocations add column if not exists student_account_id uuid references public.local_accounts(id);
update public.upec_hostel_allocations a set student_account_id=r.student_account_id from public.upec_hostel_requests r where a.request_id=r.id and a.student_account_id is null;
create unique index if not exists upec_one_active_hostel_per_student on public.upec_hostel_allocations(student_account_id) where released_at is null;
create or replace function public.upec_allocate_hostel_bed(p_request uuid,p_bed uuid,p_staff uuid)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare v_student uuid;v_status text;v_active boolean;v_id uuid;
begin
 select student_account_id,status into v_student,v_status from public.upec_hostel_requests where id=p_request for update;
 if v_student is null or v_status not in ('offered','reviewing') then raise exception 'Accommodation request not eligible'; end if;
 select active into v_active from public.upec_hostel_beds where id=p_bed for update;
 if v_active is distinct from true then raise exception 'Bed unavailable'; end if;
 insert into public.upec_hostel_allocations(request_id,bed_id,student_account_id,assigned_by)
 values(p_request,p_bed,v_student,p_staff) returning id into v_id;
 return v_id;
end $$;
create or replace function public.upec_release_hostel_bed(p_allocation uuid)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
begin
 update public.upec_hostel_allocations set released_at=now() where id=p_allocation and released_at is null;
 return found;
end $$;
revoke execute on function public.upec_allocate_hostel_bed(uuid,uuid,uuid) from public,anon,authenticated;
revoke execute on function public.upec_release_hostel_bed(uuid) from public,anon,authenticated;