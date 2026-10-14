-- UPEC platform foundation. Run through Supabase migrations; do not run with public credentials.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  role text not null default 'student' check (role in ('student','staff','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.student_biodata (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  details jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  reference_number text not null unique,
  programme text not null,
  academic_session text,
  study_centre text,
  subjects text[] not null default '{}',
  status text not null default 'draft' check(status in ('draft','submitted','under_review','approved','action_required','rejected')),
  submitted_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_upec_applications_student on public.applications(student_id);
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  provider text not null,
  provider_reference text unique,
  amount_kobo bigint not null check(amount_kobo >= 0),
  currency text not null default 'NGN',
  status text not null default 'pending' check(status in ('pending','verified','failed','refunded')),
  verified_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.cbt_rooms (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  created_by uuid not null references public.profiles(id),
  status text not null default 'waiting' check(status in ('waiting','running','ended')),
  duration_seconds integer not null default 7200 check(duration_seconds between 60 and 14400),
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.cbt_room_candidates (
  room_id uuid not null references public.cbt_rooms(id) on delete cascade,
  candidate_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'joined' check(status in ('joined','in_progress','submitted')),
  joined_at timestamptz not null default now(),
  submitted_at timestamptz,
  submit_reason text,
  primary key(room_id,candidate_id)
);
create table if not exists public.cbt_room_answers (
  room_id uuid not null,
  candidate_id uuid not null,
  question_id text not null,
  option_index integer not null check(option_index between 0 and 3),
  updated_at timestamptz not null default now(),
  primary key(room_id,candidate_id,question_id),
  foreign key(room_id,candidate_id) references public.cbt_room_candidates(room_id,candidate_id) on delete cascade
);
create table if not exists public.cbt_room_events (
  id bigint generated always as identity primary key,
  room_id uuid not null references public.cbt_rooms(id) on delete cascade,
  candidate_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null check(event_type in ('TAB_HIDDEN','WINDOW_BLUR','FULLSCREEN_EXIT','CAMERA_OFF','CAMERA_ON','RECONNECTED')),
  occurred_at timestamptz not null default now()
);
create index if not exists idx_upec_room_events on public.cbt_room_events(room_id,occurred_at desc);

-- Default deny: browser users get no access until explicit, reviewed RLS policies exist.
alter table public.profiles enable row level security;
alter table public.student_biodata enable row level security;
alter table public.applications enable row level security;
alter table public.payments enable row level security;
alter table public.cbt_rooms enable row level security;
alter table public.cbt_room_candidates enable row level security;
alter table public.cbt_room_answers enable row level security;
alter table public.cbt_room_events enable row level security;

-- New users receive a student profile; role assignment is never taken from user metadata.
create or replace function public.handle_new_upec_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id,full_name,phone,role)
  values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),new.phone,'student')
  on conflict(id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_upec_auth_user_created on auth.users;
create trigger on_upec_auth_user_created after insert on auth.users
for each row execute function public.handle_new_upec_user();
