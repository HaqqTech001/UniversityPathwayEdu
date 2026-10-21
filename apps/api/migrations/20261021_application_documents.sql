create table if not exists public.upec_application_documents (
 id uuid primary key default gen_random_uuid(),
 application_id uuid not null references public.local_student_applications(id) on delete cascade,
 student_account_id uuid not null references public.local_accounts(id) on delete cascade,
 document_type text not null check(document_type in ('academic_result','certificate','identification','other')),
 storage_path text not null unique,
 original_filename text not null,
 mime_type text not null check(mime_type in ('application/pdf','image/jpeg','image/png')),
 file_size_bytes integer not null check(file_size_bytes between 1 and 5242880),
 review_status text not null default 'pending' check(review_status in ('pending','verified','rejected')),
 review_note text,
 reviewed_by uuid references public.local_accounts(id),
 reviewed_at timestamptz,
 created_at timestamptz not null default now()
);
create index if not exists upec_application_documents_owner on public.upec_application_documents(student_account_id,application_id);
alter table public.upec_application_documents enable row level security;
revoke all on public.upec_application_documents from anon,authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('upec-application-documents','upec-application-documents',false,5242880,array['application/pdf','image/jpeg','image/png'])
on conflict(id) do update set public=false,file_size_limit=5242880,allowed_mime_types=array['application/pdf','image/jpeg','image/png'];