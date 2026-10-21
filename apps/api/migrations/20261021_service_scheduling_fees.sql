alter table public.upec_service_requests
 add column if not exists scheduled_at timestamptz,
 add column if not exists scheduled_end_at timestamptz,
 add column if not exists session_location text,
 add column if not exists assigned_staff_id uuid references public.local_accounts(id);
alter table public.upec_service_requests
 add constraint upec_service_schedule_order check (scheduled_end_at is null or (scheduled_at is not null and scheduled_end_at>scheduled_at));
create table if not exists public.upec_service_fee_rates (
 service_code text not null references public.upec_service_catalogue(code),
 delivery_mode text not null check(delivery_mode in ('online','physical')),
 amount_ngn numeric(12,2) not null check(amount_ngn>=0),
 effective_from date not null,
 created_by uuid references public.local_accounts(id),
 created_at timestamptz not null default now(),
 primary key(service_code,delivery_mode,effective_from)
);
alter table public.upec_service_fee_rates enable row level security;
revoke all on public.upec_service_fee_rates from anon,authenticated;