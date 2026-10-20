-- Guardian contacts must be explicitly verified before receiving private fee information.
create table if not exists public.upec_guardian_contacts(
 student_account_id uuid primary key references public.local_accounts(id) on delete cascade,
 guardian_name text not null,
 email text not null,
 verified_at timestamptz,
 verification_hash text,
 verification_expires_at timestamptz,
 updated_at timestamptz not null default now(),
 constraint guardian_email_format check(email ~* '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$')
);
alter table public.upec_guardian_contacts enable row level security;
revoke all on public.upec_guardian_contacts from anon,authenticated;
