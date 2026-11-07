create table if not exists public.upec_question_audit_log (
 id uuid primary key default gen_random_uuid(),
 question_id uuid not null references public.upec_teacher_questions(id) on delete cascade,
 actor_account_id uuid,
 actor_role text not null default '',
 action text not null check (action in ('created','updated','published','unpublished','imported')),
 before_data jsonb,
 after_data jsonb,
 created_at timestamptz not null default now()
);
create index if not exists upec_question_audit_log_question_idx
 on public.upec_question_audit_log(question_id, created_at desc);
create index if not exists upec_question_audit_log_actor_idx
 on public.upec_question_audit_log(actor_account_id, created_at desc);
alter table public.upec_question_audit_log enable row level security;
revoke all on public.upec_question_audit_log from anon, authenticated;
grant select, insert on public.upec_question_audit_log to service_role;