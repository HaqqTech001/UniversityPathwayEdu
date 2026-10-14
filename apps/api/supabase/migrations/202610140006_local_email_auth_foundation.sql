create table if not exists public.local_accounts (
 id uuid primary key default gen_random_uuid(),
 email text not null,
 full_name text not null,
 phone text not null,
 password_hash text not null,
 verified_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint local_accounts_email_unique unique(email)
);
create table if not exists public.local_auth_challenges (
 id uuid primary key default gen_random_uuid(),
 account_id uuid not null references public.local_accounts(id) on delete cascade,
 purpose text not null check (purpose in ('signup','recovery')),
 token_hash text not null,
 expires_at timestamptz not null,
 attempts int not null default 0,
 consumed_at timestamptz,
 created_at timestamptz not null default now()
);
create index if not exists local_auth_challenges_account_idx on public.local_auth_challenges(account_id,purpose,created_at desc);
alter table public.local_accounts enable row level security;
alter table public.local_auth_challenges enable row level security;
revoke all on public.local_accounts,public.local_auth_challenges from anon,authenticated;
