-- Persist staff-issued CBT messages for the student notification centre.
create table if not exists public.upec_cbt_student_notifications (
 id uuid primary key default gen_random_uuid(),
 student_account_id uuid not null,
 assessment_id uuid not null,
 notification_key text not null,
 title text not null,
 body text not null,
 created_at timestamptz not null default now(),
 constraint upec_cbt_student_notification_unique unique (student_account_id,notification_key)
);
create index if not exists upec_cbt_student_notifications_student_idx
 on public.upec_cbt_student_notifications(student_account_id,created_at desc);
alter table public.upec_cbt_student_notifications enable row level security;
revoke all on public.upec_cbt_student_notifications from anon,authenticated;
