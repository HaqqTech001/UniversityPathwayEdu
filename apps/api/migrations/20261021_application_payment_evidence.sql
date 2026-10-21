-- Uploaded payment evidence is NOT payment verification.
create table if not exists public.upec_application_payment_evidence (
 id uuid primary key default gen_random_uuid(),
 student_account_id uuid not null references public.local_accounts(id) on delete cascade,
 storage_path text not null unique,
 mime_type text not null check(mime_type in ('application/pdf','image/png','image/jpeg')),
 file_size_bytes integer,
 application_id uuid unique references public.local_student_applications(id),
 review_status text not null default 'pending' check(review_status in ('pending','verified','rejected')),
 created_at timestamptz not null default now()
);
create index if not exists upec_payment_evidence_owner on public.upec_application_payment_evidence(student_account_id,created_at desc);
alter table public.upec_application_payment_evidence enable row level security;
revoke all on public.upec_application_payment_evidence from anon,authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('upec-application-payment','upec-application-payment',false,5242880,array['application/pdf','image/png','image/jpeg'])
on conflict(id) do nothing;
