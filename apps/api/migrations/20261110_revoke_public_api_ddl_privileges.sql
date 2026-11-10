-- Public API roles must not have schema-level destructive or DDL-related table privileges.
-- Normal row-level access remains governed by the existing grants and RLS policies.
revoke truncate, trigger, references on all tables in schema public from anon, authenticated;
revoke update on all sequences in schema public from anon, authenticated;

-- Legacy direct RPC is not used by the current backend-managed student application flow.
-- The service role retains execution for any controlled server-side maintenance.
revoke all on function public.submit_upec_application(uuid) from public, anon, authenticated;
