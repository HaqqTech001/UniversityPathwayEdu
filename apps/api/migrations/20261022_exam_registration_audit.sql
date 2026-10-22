-- Append-only history of verification decisions for external examination registrations.
create table if not exists public.upec_exam_registration_audit (
 id uuid primary key default gen_random_uuid(),
 registration_id uuid not null references public.upec_exam_registrations(id) on delete restrict,
 actor_id uuid not null references public.local_accounts(id),
 action text not null check(action in ('verified')),
 created_at timestamptz not null default now()
);
create index if not exists upec_exam_registration_audit_lookup on public.upec_exam_registration_audit(registration_id,created_at desc);
alter table public.upec_exam_registration_audit enable row level security;
revoke all on public.upec_exam_registration_audit from anon,authenticated;
-- Database trigger ensures an audit entry is written in the same transaction as verification.
create or replace function public.upec_audit_exam_verification() returns trigger
language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if new.status='verified' and old.status is distinct from 'verified' then
  insert into public.upec_exam_registration_audit(registration_id,actor_id,action)
  values(new.id,new.verified_by,'verified');
 end if;
 return new;
end $$;
drop trigger if exists upec_exam_verified_audit_trigger on public.upec_exam_registrations;
create trigger upec_exam_verified_audit_trigger after update of status on public.upec_exam_registrations
for each row execute function public.upec_audit_exam_verification();
