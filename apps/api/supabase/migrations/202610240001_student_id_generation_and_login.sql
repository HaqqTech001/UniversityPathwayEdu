-- ============================================================================
-- UNIVERSITY PATHWAY EDUCATIONAL CONSULT (UPEC)
-- MIGRATION: Immediate Student ID Generation and Student ID Login Support
-- FORMAT: UP/YYYY/SERIAL (e.g. UP/2026/001, UP/2026/002)
-- ============================================================================

-- 1. Annual sequence tracker ensuring concurrency safety and uniqueness
create table if not exists public.student_id_sequences (
  year integer primary key,
  last_serial integer not null default 0,
  updated_at timestamptz not null default now()
);

-- 2. Add student_id column to local_accounts (unique, permanent association)
alter table public.local_accounts 
  add column if not exists student_id text;

-- Add unique constraint if not exists
do $$
begin
  if not exists (
    select 1 from pg_constraint 
    where conname = 'local_accounts_student_id_unique'
  ) then
    alter table public.local_accounts 
      add constraint local_accounts_student_id_unique unique (student_id);
  end if;
end;
$$;

create index if not exists idx_local_accounts_student_id 
  on public.local_accounts(upper(student_id));

-- 3. Dedicated student_identifiers association table
create table if not exists public.student_identifiers (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null unique references public.local_accounts(id) on delete cascade,
  student_id text not null unique,
  year integer not null,
  serial integer not null,
  created_at timestamptz not null default now(),
  constraint chk_student_id_format check (student_id ~ '^UP\/[0-9]{4}\/[0-9]{3,}$')
);

create index if not exists idx_student_identifiers_student_id 
  on public.student_identifiers(upper(student_id));

-- 4. RLS security policies on student_identifiers and sequences
alter table public.student_identifiers enable row level security;
alter table public.student_id_sequences enable row level security;

-- Revoke public permissions to prevent enumeration or email harvesting
revoke all on public.student_identifiers from anon, authenticated;
revoke all on public.student_id_sequences from anon, authenticated;

-- Service role has full management
grant all on public.student_identifiers to service_role;
grant all on public.student_id_sequences to service_role;

-- 5. Concurrency-safe, atomic ID generation function
create or replace function public.upec_assign_student_id(
  p_account_id uuid,
  p_year integer default extract(year from current_date)::integer
)
returns text
language plpgsql
security definer
as $$
declare
  v_existing text;
  v_serial integer;
  v_student_id text;
begin
  -- 1. Check if the account already has an assigned Student ID
  select student_id into v_existing
  from public.local_accounts
  where id = p_account_id;

  if v_existing is not null and v_existing <> '' then
    return v_existing;
  end if;

  -- 2. Concurrency-safe atomic serial increment via ON CONFLICT DO UPDATE
  insert into public.student_id_sequences (year, last_serial, updated_at)
  values (p_year, 1, now())
  on conflict (year) do update
    set last_serial = public.student_id_sequences.last_serial + 1,
        updated_at = now()
  returning last_serial into v_serial;

  -- 3. Format as UP/YYYY/SERIAL with zero-padding (minimum 3 digits)
  v_student_id := 'UP/' || p_year::text || '/' || lpad(v_serial::text, 3, '0');

  -- 4. Persist to local_accounts
  update public.local_accounts
  set student_id = v_student_id,
      updated_at = now()
  where id = p_account_id;

  -- 5. Record in student_identifiers table
  insert into public.student_identifiers (account_id, student_id, year, serial)
  values (p_account_id, v_student_id, p_year, v_serial)
  on conflict (account_id) do update
    set student_id = excluded.student_id;

  return v_student_id;
end;
$$;

-- 6. Safe backfill for existing student accounts without Student IDs
-- Processes existing accounts in chronological creation order
-- Will not overwrite existing Student IDs or collide
do $$
declare
  r record;
  v_year integer;
  v_assigned_id text;
begin
  for r in 
    select id, created_at 
    from public.local_accounts 
    where student_id is null or student_id = ''
    order by created_at asc
  loop
    v_year := coalesce(extract(year from r.created_at)::integer, extract(year from current_date)::integer);
    v_assigned_id := public.upec_assign_student_id(r.id, v_year);
  end loop;
end;
$$;
