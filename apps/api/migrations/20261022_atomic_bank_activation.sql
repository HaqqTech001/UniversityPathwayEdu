-- Atomically replace the active UPEC bank destination.
create or replace function public.upec_activate_bank_account(p_account_id uuid,p_actor_id uuid)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare selected_id uuid;
begin
 if not exists(select 1 from public.local_staff_members where account_id=p_actor_id and active=true and (role in ('admin','super_admin') or permissions @> array['finance.manage']::text[])) then raise exception 'Not authorized' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(708241,20261022);
 select id into selected_id from public.upec_bank_accounts where id=p_account_id for update;
 if selected_id is null then raise exception 'Bank account not found' using errcode='P0002'; end if;
 update public.upec_bank_accounts set is_active=false,updated_by=p_actor_id,updated_at=now() where is_active=true and id<>p_account_id;
 update public.upec_bank_accounts set is_active=true,updated_by=p_actor_id,updated_at=now() where id=p_account_id;
 return p_account_id;
end $$;
revoke all on function public.upec_activate_bank_account(uuid,uuid) from public,anon,authenticated;

grant execute on function public.upec_activate_bank_account(uuid,uuid) to service_role;
