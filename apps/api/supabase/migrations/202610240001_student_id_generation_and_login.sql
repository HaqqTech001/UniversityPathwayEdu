-- ============================================================================
-- UNIVERSITY PATHWAY EDUCATIONAL CONSULT (UPEC)
-- MIGRATION: Immediate Student ID Generation and Student ID Login Support
-- FORMAT: UP/YYYY/SERIAL (e.g. UP/2026/001, UP/2026/002)
-- PRODUCTION SAFETY CORRECTIONS: Concurrency safety, Idempotency, Strict RLS,
-- Explicit search_path, Account Validation, and Collision-Safe Backfill
-- ============================================================================

-- 1. Annual sequence tracker ensuring database-level concurrency safety and uniqueness
CREATE TABLE IF NOT EXISTS public.student_id_sequences (
  year integer PRIMARY KEY,
  last_serial integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_positive_serial CHECK (last_serial >= 0)
);

-- 2. Add student_id column to local_accounts (unique, permanent association)
ALTER TABLE public.local_accounts 
  ADD COLUMN IF NOT EXISTS student_id text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'local_accounts_student_id_unique'
  ) THEN
    ALTER TABLE public.local_accounts 
      ADD CONSTRAINT local_accounts_student_id_unique UNIQUE (student_id);
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_local_accounts_student_id 
  ON public.local_accounts(upper(student_id));

-- 3. Dedicated student_identifiers association table
CREATE TABLE IF NOT EXISTS public.student_identifiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL UNIQUE REFERENCES public.local_accounts(id) ON DELETE CASCADE,
  student_id text NOT NULL UNIQUE,
  year integer NOT NULL,
  serial integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_student_id_format CHECK (student_id ~ '^UP\/[0-9]{4}\/[0-9]{3,}$')
);

CREATE INDEX IF NOT EXISTS idx_student_identifiers_student_id 
  ON public.student_identifiers(upper(student_id));

-- 4. RLS security policies on student_identifiers and sequences
ALTER TABLE public.student_identifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_id_sequences ENABLE ROW LEVEL SECURITY;

-- Revoke all permissions from PUBLIC, anon, and authenticated to prevent enumeration
REVOKE ALL ON public.student_identifiers FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.student_id_sequences FROM PUBLIC, anon, authenticated;

-- Service role has full management
GRANT ALL ON public.student_identifiers TO service_role;
GRANT ALL ON public.student_id_sequences TO service_role;

-- 5. Concurrency-safe, atomic, idempotent ID generation function
CREATE OR REPLACE FUNCTION public.upec_assign_student_id(
  p_account_id uuid,
  p_year integer DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::integer
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_existing text;
  v_serial integer;
  v_student_id text;
BEGIN
  -- 1. Validate account existence and obtain row-level lock
  SELECT student_id INTO v_existing
  FROM public.local_accounts
  WHERE id = p_account_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ACCOUNT_NOT_FOUND: Account % does not exist in local_accounts', p_account_id;
  END IF;

  -- 2. Idempotency guarantee: if already assigned, return existing ID without allocating new serial
  IF v_existing IS NOT NULL AND v_existing <> '' THEN
    -- Ensure student_identifiers is synchronized
    INSERT INTO public.student_identifiers (account_id, student_id, year, serial)
    SELECT p_account_id, v_existing, 
           COALESCE(SUBSTRING(v_existing FROM '^UP/([0-9]{4})/')::integer, p_year),
           COALESCE(SUBSTRING(v_existing FROM '^UP/[0-9]{4}/([0-9]+)$')::integer, 0)
    ON CONFLICT (account_id) DO UPDATE 
      SET student_id = EXCLUDED.student_id
      WHERE public.student_identifiers.student_id <> EXCLUDED.student_id;

    RETURN v_existing;
  END IF;

  -- 3. Check student_identifiers table in case local_accounts column was not set
  SELECT student_id INTO v_existing
  FROM public.student_identifiers
  WHERE account_id = p_account_id;

  IF v_existing IS NOT NULL AND v_existing <> '' THEN
    UPDATE public.local_accounts
    SET student_id = v_existing, updated_at = now()
    WHERE id = p_account_id;

    RETURN v_existing;
  END IF;

  -- 4. Concurrency-safe atomic serial increment via row lock in student_id_sequences
  INSERT INTO public.student_id_sequences (year, last_serial, updated_at)
  VALUES (p_year, 1, now())
  ON CONFLICT (year) DO UPDATE
    SET last_serial = public.student_id_sequences.last_serial + 1,
        updated_at = now()
  RETURNING last_serial INTO v_serial;

  -- 5. Format as UP/YYYY/SERIAL (zero-padded to minimum 3 digits)
  v_student_id := 'UP/' || p_year::text || '/' || LPAD(v_serial::text, 3, '0');

  -- 6. Atomically persist to local_accounts
  UPDATE public.local_accounts
  SET student_id = v_student_id,
      updated_at = now()
  WHERE id = p_account_id;

  -- 7. Record in student_identifiers table
  INSERT INTO public.student_identifiers (account_id, student_id, year, serial)
  VALUES (p_account_id, v_student_id, p_year, v_serial)
  ON CONFLICT (account_id) DO UPDATE
    SET student_id = EXCLUDED.student_id,
        year = EXCLUDED.year,
        serial = EXCLUDED.serial;

  RETURN v_student_id;
END;
$$;

-- Revoke execution from PUBLIC, anon, authenticated; grant strictly to service_role
REVOKE ALL ON FUNCTION public.upec_assign_student_id(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.upec_assign_student_id(uuid, integer) TO service_role;

-- 6. Transactional student account registration function
CREATE OR REPLACE FUNCTION public.upec_register_student_account(
  p_email text,
  p_full_name text,
  p_phone text,
  p_password_hash text,
  p_year integer DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_account_id uuid;
  v_student_id text;
  v_existing_verified boolean;
  v_normalized_email text := lower(trim(p_email));
BEGIN
  -- Check for existing account
  SELECT id, (verified_at IS NOT NULL), student_id 
  INTO v_account_id, v_existing_verified, v_student_id
  FROM public.local_accounts
  WHERE email = v_normalized_email
  FOR UPDATE;

  IF FOUND THEN
    IF v_existing_verified THEN
      RAISE EXCEPTION 'EMAIL_REGISTERED: Email % is already registered', p_email;
    END IF;

    -- Update partially created unverified account
    UPDATE public.local_accounts
    SET full_name = trim(p_full_name),
        phone = trim(p_phone),
        password_hash = p_password_hash,
        updated_at = now()
    WHERE id = v_account_id;
  ELSE
    -- Insert new account record
    INSERT INTO public.local_accounts (email, full_name, phone, password_hash)
    VALUES (v_normalized_email, trim(p_full_name), trim(p_phone), p_password_hash)
    RETURNING id INTO v_account_id;
  END IF;

  -- Authoritatively assign or retrieve Student ID
  v_student_id := public.upec_assign_student_id(v_account_id, p_year);

  RETURN jsonb_build_object(
    'id', v_account_id,
    'email', v_normalized_email,
    'student_id', v_student_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.upec_register_student_account(text, text, text, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.upec_register_student_account(text, text, text, text, integer) TO service_role;

-- 7. Safe backfill for existing student accounts without Student IDs
-- First synchronizes sequence tracker with highest existing serials per year
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT 
      SUBSTRING(student_id FROM '^UP/([0-9]{4})/')::integer AS id_year,
      MAX(SUBSTRING(student_id FROM '^UP/[0-9]{4}/([0-9]+)$')::integer) AS max_serial
    FROM public.local_accounts
    WHERE student_id ~ '^UP/[0-9]{4}/[0-9]+$'
    GROUP BY 1
  LOOP
    IF r.id_year IS NOT NULL AND r.max_serial IS NOT NULL THEN
      INSERT INTO public.student_id_sequences (year, last_serial, updated_at)
      VALUES (r.id_year, r.max_serial, now())
      ON CONFLICT (year) DO UPDATE
        SET last_serial = GREATEST(public.student_id_sequences.last_serial, EXCLUDED.last_serial),
            updated_at = now();
    END IF;
  END LOOP;
END;
$$;

-- Safely backfill accounts missing Student IDs in chronological order
DO $$
DECLARE
  r RECORD;
  v_year integer;
  v_assigned_id text;
BEGIN
  FOR r IN 
    SELECT id, created_at 
    FROM public.local_accounts 
    WHERE student_id IS NULL OR student_id = ''
    ORDER BY created_at ASC
  LOOP
    v_year := COALESCE(EXTRACT(YEAR FROM r.created_at)::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer);
    v_assigned_id := public.upec_assign_student_id(r.id, v_year);
  END LOOP;
END;
$$;
