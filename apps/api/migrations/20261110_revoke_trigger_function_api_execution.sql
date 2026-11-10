-- These SECURITY DEFINER functions are trigger handlers, not public RPC endpoints.
-- Their triggers continue to execute them without exposing direct invocation to API roles.
revoke all on function public.upec_audit_exam_verification() from public, anon, authenticated;
revoke all on function public.upec_guard_student_biodata() from public, anon, authenticated;
revoke all on function public.upec_issue_registration_number() from public, anon, authenticated;
