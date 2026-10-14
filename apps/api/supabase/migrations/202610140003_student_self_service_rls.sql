create policy "profiles_read_self" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "profiles_update_self" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
revoke update on public.profiles from authenticated;
grant update (full_name,phone) on public.profiles to authenticated;
create policy "biodata_read_self" on public.student_biodata for select to authenticated using (user_id = (select auth.uid()));
create policy "biodata_insert_self" on public.student_biodata for insert to authenticated with check (user_id = (select auth.uid()));
create policy "biodata_update_self" on public.student_biodata for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "applications_read_self" on public.applications for select to authenticated using (student_id = (select auth.uid()));
create policy "payments_read_self" on public.payments for select to authenticated using (application_id in (select id from public.applications where student_id = (select auth.uid())));
