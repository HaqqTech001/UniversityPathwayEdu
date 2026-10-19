-- Apply through a reviewed Supabase SQL migration before enabling staff access.
create table if not exists public.local_staff_members (
 account_id uuid primary key references public.local_accounts(id) on delete cascade,
 role text not null check (role in ('super_admin','admin','admissions_officer','teacher','cbt_manager','content_editor')),
 permissions text[] not null default '{}',
 active boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists local_staff_members_active_idx on public.local_staff_members(active);
alter table public.local_staff_members enable row level security;
-- No browser-facing policies. Only the server service role accesses staff memberships.
-- Bootstrap Super Admin by verified, manual SQL administration; never through a public registration endpoint.
