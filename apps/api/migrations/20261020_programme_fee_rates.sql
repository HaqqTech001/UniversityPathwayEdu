-- Monthly lesson fees can be revised prospectively by admins.
-- Existing student invoices retain their originally assigned amount.
create table if not exists public.upec_programme_fee_rates (
 id uuid primary key default gen_random_uuid(),
 programme_code text not null check(length(trim(programme_code)) between 2 and 100),
 monthly_amount_ngn numeric(12,2) not null check(monthly_amount_ngn>=0),
 effective_month date not null check(extract(day from effective_month)=1),
 created_by uuid not null references public.local_accounts(id),
 created_at timestamptz not null default now(),
 unique(programme_code,effective_month)
);
create index if not exists upec_fee_rate_lookup_idx on public.upec_programme_fee_rates(programme_code,effective_month desc);
create table if not exists public.upec_student_monthly_fees (
 id uuid primary key default gen_random_uuid(),
 student_account_id uuid not null references public.local_accounts(id),
 programme_code text not null,
 billing_month date not null check(extract(day from billing_month)=1),
 amount_due_ngn numeric(12,2) not null check(amount_due_ngn>=0),
 amount_paid_ngn numeric(12,2) not null default 0 check(amount_paid_ngn>=0),
 status text not null default 'unpaid' check(status in ('unpaid','partial','paid','waived')),
 created_at timestamptz not null default now(),
 unique(student_account_id,programme_code,billing_month)
);
alter table public.upec_programme_fee_rates enable row level security;
alter table public.upec_student_monthly_fees enable row level security;
revoke all on public.upec_programme_fee_rates,public.upec_student_monthly_fees from anon,authenticated;
