-- One active institutional payment destination, unpublished until approved by finance.
create table if not exists public.upec_bank_accounts (
 id uuid primary key default gen_random_uuid(),
 bank_name text not null check(length(trim(bank_name)) between 2 and 100),
 account_number text not null check(account_number ~ '^[0-9]{10}$'),
 account_name text not null check(length(trim(account_name)) between 3 and 160),
 is_active boolean not null default false,
 created_by uuid not null references public.local_accounts(id),
 updated_by uuid not null references public.local_accounts(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create unique index if not exists upec_one_active_bank_account on public.upec_bank_accounts(is_active) where is_active;
alter table public.upec_bank_accounts enable row level security;
revoke all on public.upec_bank_accounts from anon,authenticated;
