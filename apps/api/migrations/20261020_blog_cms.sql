create table if not exists public.upec_blog_posts (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 title text not null check(length(trim(title)) between 5 and 180),
 category text not null check(category in ('Study Strategies','Exam Preparation','Admissions Guidance')),
 excerpt text not null check(length(trim(excerpt)) between 20 and 400),
 sections jsonb not null check(jsonb_typeof(sections)='array'),
 minutes integer not null check(minutes between 1 and 60),
 status text not null default 'draft' check(status in ('draft','published')),
 created_by uuid not null references public.local_accounts(id),
 published_at timestamptz,
 created_at timestamptz not null default now()
);
create index if not exists upec_blog_published_idx on public.upec_blog_posts(status,published_at desc);
alter table public.upec_blog_posts enable row level security;
revoke all on public.upec_blog_posts from anon,authenticated;
