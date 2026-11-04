-- ============================================================================
-- UNIVERSITY PATHWAY EDUCATIONAL CONSULT (UPEC)
-- MIGRATION: Secure Super Admin Provisioning & Role Hierarchy Enforcement
-- ============================================================================

-- 1. Ensure local_staff_members table exists with strict constraints
CREATE TABLE IF NOT EXISTS public.local_staff_members (
  account_id uuid PRIMARY KEY REFERENCES public.local_accounts(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('super_admin','admin','admissions_officer','teacher','cbt_manager','content_editor')),
  permissions text[] NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS local_staff_members_active_idx ON public.local_staff_members(active);

-- 2. RLS Security Hardening: Revoke public access, allow service_role management
ALTER TABLE public.local_staff_members ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.local_staff_members FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.local_staff_members TO service_role;

-- 3. Idempotent Super Admin Provisioning Function
-- Automatically promotes an existing verified local_account to super_admin staff member
CREATE OR REPLACE FUNCTION public.upec_provision_super_admin(
  p_email text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_account_id uuid;
  v_email text := lower(trim(p_email));
  v_role text := 'super_admin';
  v_permissions text[] := ARRAY[
    'applications.read',
    'applications.review',
    'staff.manage',
    'content.manage',
    'cbt.manage',
    'finance.manage',
    'students.manage'
  ];
BEGIN
  -- Find account in local_accounts
  SELECT id INTO v_account_id
  FROM public.local_accounts
  WHERE email = v_email;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ACCOUNT_NOT_FOUND: No local_account found with email %', p_email;
  END IF;

  -- Upsert staff membership as active super_admin
  INSERT INTO public.local_staff_members (account_id, role, permissions, active, updated_at)
  VALUES (v_account_id, v_role, v_permissions, true, now())
  ON CONFLICT (account_id) DO UPDATE
    SET role = EXCLUDED.role,
        permissions = EXCLUDED.permissions,
        active = true,
        updated_at = now();

  -- Ensure account is marked verified
  UPDATE public.local_accounts
  SET verified_at = COALESCE(verified_at, now()),
      updated_at = now()
  WHERE id = v_account_id;

  RETURN jsonb_build_object(
    'account_id', v_account_id,
    'email', v_email,
    'role', v_role,
    'active', true
  );
END;
$$;

REVOKE ALL ON FUNCTION public.upec_provision_super_admin(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.upec_provision_super_admin(text) TO service_role;
