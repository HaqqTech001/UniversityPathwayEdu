create table if not exists public.upec_service_catalogue (
 code text primary key check(code in ('extramural_lessons','educational_consultation')),
 name text not null,
 description text not null default '',
 active boolean not null default true,
 allow_online boolean not null default true,
 allow_physical boolean not null default true,
 fee_ngn numeric(12,2) check(fee_ngn>=0),
 updated_at timestamptz not null default now()
);
insert into public.upec_service_catalogue(code,name,description) values
('extramural_lessons','Extramural Lessons','Additional coaching and preparatory lessons, subject to approved schedules.'),
('educational_consultation','Educational Consultation','Academic guidance and educational counselling by appointment.')
on conflict(code) do nothing;
create table if not exists public.upec_service_requests (
 id uuid primary key default gen_random_uuid(),
 student_account_id uuid not null references public.local_accounts(id),
 service_code text not null references public.upec_service_catalogue(code),
 delivery_mode text not null check(delivery_mode in ('online','physical')),
 requested_subject text not null check(length(trim(requested_subject)) between 3 and 500),
 preferred_schedule text,
 status text not null default 'pending' check(status in ('pending','reviewing','confirmed','completed','declined')),
 staff_notes text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists upec_service_request_student_idx on public.upec_service_requests(student_account_id,created_at desc);
alter table public.upec_service_catalogue enable row level security;
alter table public.upec_service_requests enable row level security;
revoke all on public.upec_service_catalogue,public.upec_service_requests from anon,authenticated;