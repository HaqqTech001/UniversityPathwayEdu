revoke all on function public.handle_new_upec_user() from public, anon, authenticated;
grant execute on function public.handle_new_upec_user() to service_role;
