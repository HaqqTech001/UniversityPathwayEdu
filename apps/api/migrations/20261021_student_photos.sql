create table if not exists public.upec_student_photos (
 student_account_id uuid primary key references public.local_accounts(id) on delete cascade,
 storage_path text not null unique,
 mime_type text not null check(mime_type in ('image/jpeg','image/png')),
 uploaded_at timestamptz not null default now()
);
alter table public.upec_student_photos enable row level security;
revoke all on public.upec_student_photos from anon,authenticated;
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('upec-student-photos','upec-student-photos',false,5242880,array['image/jpeg','image/png'])
on conflict(id) do update set public=false,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png'];