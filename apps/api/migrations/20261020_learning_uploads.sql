-- Apply after learning resources migration. Private bucket; no public storage policies.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('upec-learning','upec-learning',false,8388608,array['application/pdf','image/png','image/jpeg','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.presentationml.presentation'])
on conflict(id) do nothing;
alter table public.upec_learning_resources add column if not exists storage_path text;
alter table public.upec_learning_resources alter column resource_url drop not null;
alter table public.upec_learning_resources drop constraint if exists upec_learning_resource_location_check;
alter table public.upec_learning_resources add constraint upec_learning_resource_location_check
 check ((storage_path is not null and resource_url is null) or (storage_path is null and resource_url is not null));
