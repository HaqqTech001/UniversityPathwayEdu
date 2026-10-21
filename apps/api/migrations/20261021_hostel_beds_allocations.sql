create table if not exists public.upec_hostel_beds (
 id uuid primary key default gen_random_uuid(),
 hostel_name text not null check(length(trim(hostel_name)) between 2 and 120),
 room_code text not null check(length(trim(room_code)) between 1 and 60),
 bed_code text not null check(length(trim(bed_code)) between 1 and 30),
 active boolean not null default true,
 created_at timestamptz not null default now(),
 unique(hostel_name,room_code,bed_code)
);
create table if not exists public.upec_hostel_allocations (
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null references public.upec_hostel_requests(id),
 bed_id uuid not null references public.upec_hostel_beds(id),
 assigned_by uuid references public.local_accounts(id),
 assigned_at timestamptz not null default now(),
 released_at timestamptz,
 check(released_at is null or released_at >= assigned_at)
);
create unique index if not exists upec_active_hostel_bed_unique on public.upec_hostel_allocations(bed_id) where released_at is null;
create unique index if not exists upec_active_hostel_request_unique on public.upec_hostel_allocations(request_id) where released_at is null;
alter table public.upec_hostel_beds enable row level security;
alter table public.upec_hostel_allocations enable row level security;
revoke all on public.upec_hostel_beds,public.upec_hostel_allocations from anon,authenticated;