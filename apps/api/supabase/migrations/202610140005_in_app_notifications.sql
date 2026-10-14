create table if not exists public.notifications (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id) on delete cascade,
 category text not null check(category in ('account','application','payment','cbt','admission','announcement')),
 title text not null check(char_length(title) between 1 and 160),
 body text not null check(char_length(body) between 1 and 2000),
 action_url text,
 read_at timestamptz,
 created_at timestamptz not null default now()
);
create index if not exists idx_upec_notifications_user_unread on public.notifications(user_id,created_at desc) where read_at is null;
create index if not exists idx_upec_notifications_user_history on public.notifications(user_id,created_at desc);
alter table public.notifications enable row level security;
create policy "notifications_read_own" on public.notifications for select to authenticated using (user_id=(select auth.uid()));
create policy "notifications_mark_own_read" on public.notifications for update to authenticated using (user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
revoke insert,delete,update on public.notifications from authenticated,anon;
grant select on public.notifications to authenticated;
grant update(read_at) on public.notifications to authenticated;
create table if not exists public.notification_preferences (
 user_id uuid primary key references public.profiles(id) on delete cascade,
 email_application_updates boolean not null default true,
 email_cbt_reminders boolean not null default true,
 email_announcements boolean not null default true,
 updated_at timestamptz not null default now()
);
alter table public.notification_preferences enable row level security;
create policy "notification_preferences_read_own" on public.notification_preferences for select to authenticated using(user_id=(select auth.uid()));
create policy "notification_preferences_insert_own" on public.notification_preferences for insert to authenticated with check(user_id=(select auth.uid()));
create policy "notification_preferences_update_own" on public.notification_preferences for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
