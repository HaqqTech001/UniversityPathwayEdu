-- Teacher learning library: published resources are visible to verified students via the API.
create table if not exists public.upec_learning_resources (
 id uuid primary key default gen_random_uuid(),
 subject_id uuid not null references public.upec_academic_subjects(id) on delete restrict,
 author_account_id uuid not null references public.local_accounts(id),
 title text not null check(length(trim(title)) between 5 and 180),
 description text not null default '',
 resource_url text not null check(length(resource_url)<=2048 and resource_url ~ '^https://'),
 resource_type text not null check(resource_type in ('document','video','website','exercise')),
 status text not null default 'draft' check(status in ('draft','published')),
 created_at timestamptz not null default now()
);
create index if not exists upec_resource_subject_idx on public.upec_learning_resources(subject_id,status);
alter table public.upec_learning_resources enable row level security;
revoke all on public.upec_learning_resources from anon,authenticated;
