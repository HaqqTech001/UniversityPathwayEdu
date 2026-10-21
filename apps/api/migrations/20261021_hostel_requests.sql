create table if not exists public.upec_hostel_requests (
 id uuid primary key default gen_random_uuid(),
 application_id uuid not null unique references public.local_student_applications(id) on delete cascade,
 student_account_id uuid not null references public.local_accounts(id),
 status text not null default 'pending' check(status in ('pending','reviewing','waitlisted','offered','declined','withdrawn')),
 staff_note text,
 accommodation_detail text,
 reviewed_by uuid references public.local_accounts(id),
 reviewed_at timestamptz,
 created_at timestamptz not null default now()
);
create index if not exists upec_hostel_requests_student_idx on public.upec_hostel_requests(student_account_id);
alter table public.upec_hostel_requests enable row level security;
revoke all on public.upec_hostel_requests from anon,authenticated;
insert into public.upec_hostel_requests(application_id,student_account_id)
select id,account_id from public.local_student_applications
where lower(coalesce(form_data->>'hostelInterest',''))='yes'
on conflict(application_id) do nothing;