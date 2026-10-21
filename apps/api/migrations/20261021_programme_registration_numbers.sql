-- UPEC enrolment numbers are issued only when an application is approved.
-- Each programme and year has its own independent, concurrency-safe sequence.
create table if not exists public.upec_registration_counters (
 registration_year integer not null,
 programme_code text not null,
 last_number integer not null default 0,
 primary key (registration_year,programme_code)
);
alter table public.upec_registration_counters enable row level security;
revoke all on public.upec_registration_counters from anon,authenticated;
alter table public.local_student_applications add column if not exists student_registration_number text;
create unique index if not exists upec_student_registration_unique on public.local_student_applications(student_registration_number) where student_registration_number is not null;
create or replace function public.upec_issue_registration_number() returns trigger
language plpgsql security definer set search_path=public,pg_temp as $$
declare yr integer; seq integer; code text;
begin
 if new.status='approved' and old.status is distinct from 'approved' and new.student_registration_number is null then
   yr:=extract(year from now() at time zone 'Africa/Lagos')::integer;
   code:=upper(regexp_replace(trim(new.programme),'[^A-Za-z0-9]','','g'));
   if length(code)<2 or length(code)>18 then raise exception 'Invalid programme code for registration'; end if;
   insert into public.upec_registration_counters(registration_year,programme_code,last_number)
   values(yr,code,1)
   on conflict(registration_year,programme_code)
   do update set last_number=public.upec_registration_counters.last_number+1
   returning last_number into seq;
   new.student_registration_number:=lpad((yr%100)::text,2,'0')||'/UP'||code||'/'||lpad(seq::text,3,'0');
 end if;
 return new;
end $$;
drop trigger if exists upec_assign_registration_after_approval on public.local_student_applications;
create trigger upec_assign_registration_after_approval before update of status
on public.local_student_applications for each row
execute function public.upec_issue_registration_number();
