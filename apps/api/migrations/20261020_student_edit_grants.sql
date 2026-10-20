create table if not exists public.upec_student_edit_grants (
 student_account_id uuid primary key references public.local_accounts(id) on delete cascade,
 biodata_edit_allowed boolean not null default false,
 programme_change_allowed boolean not null default false,
 updated_by uuid references public.local_accounts(id),
 updated_at timestamptz not null default now()
);
alter table public.upec_student_edit_grants enable row level security;
revoke all on public.upec_student_edit_grants from anon,authenticated;
-- Database-enforced guard: blocks edits after completion even if API is bypassed.
create or replace function public.upec_guard_student_biodata()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if old.completed_at is not null and
    (new.details is distinct from old.details or new.completed_at is distinct from old.completed_at)
    and not coalesce((select biodata_edit_allowed from public.upec_student_edit_grants where student_account_id=old.account_id),false)
 then raise exception 'Biodata locked; administrator approval required' using errcode='42501'; end if;
 return new;
end $$;
drop trigger if exists upec_guard_student_biodata_update on public.local_student_biodata;
create trigger upec_guard_student_biodata_update before update on public.local_student_biodata
for each row execute function public.upec_guard_student_biodata();
