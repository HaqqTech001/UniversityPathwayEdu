-- Registration fee changes are dated and audited, without overwriting historic rates.
create table if not exists public.upec_registration_fee_rates (
 id uuid primary key default gen_random_uuid(),
 programme_code text not null check(length(trim(programme_code)) between 2 and 100),
 amount_ngn numeric(12,2) not null check(amount_ngn >= 0),
 effective_month date not null check(extract(day from effective_month)=1),
 created_by uuid not null references public.local_accounts(id),
 created_at timestamptz not null default now(),
 unique(programme_code,effective_month)
);
create index if not exists upec_registration_rate_lookup on public.upec_registration_fee_rates(programme_code,effective_month desc);
alter table public.upec_registration_fee_rates enable row level security;
revoke all on public.upec_registration_fee_rates from anon,authenticated;
