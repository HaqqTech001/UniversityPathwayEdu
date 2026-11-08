-- Enforce JAMB UTME combination subjects against the year-specific shared subject catalogue.
-- The 2027 option list is source-checked from the official IBASS eligibility checker.
-- Institution/course combinations remain separately provisional until their exact IBASS rule is checked.

create or replace function public.upec_validate_jamb_utme_combination_subject_catalogue()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  requested_subject text;
begin
  if new.source_verified and not new.active then
    raise exception 'An inactive JAMB combination cannot remain source-verified.'
      using errcode = '23514';
  end if;

  if not new.active then
    return new;
  end if;

  if jsonb_typeof(coalesce(new.subject_group_rules, '[]'::jsonb)) <> 'array' then
    raise exception 'JAMB subject group rules must be an array.'
      using errcode = '23514';
  end if;

  if new.source_verified and jsonb_array_length(coalesce(new.subject_group_rules, '[]'::jsonb)) > 0 then
    raise exception 'Subject-group combinations must remain provisional until group-rule verification is implemented.'
      using errcode = '23514';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(coalesce(new.subject_group_rules, '[]'::jsonb)) as groups(rule)
    where jsonb_typeof(groups.rule) <> 'object'
       or jsonb_typeof(groups.rule -> 'subjects') <> 'array'
       or jsonb_typeof(groups.rule -> 'choose') <> 'number'
       or coalesce(groups.rule ->> 'name', '') = ''
       or (groups.rule ->> 'choose')::integer < 1
       or (groups.rule ->> 'choose')::integer >
          jsonb_array_length(groups.rule -> 'subjects')
  ) then
    raise exception 'Each JAMB subject group needs a name, subject list and valid choose count.'
      using errcode = '23514';
  end if;

  for requested_subject in
    select lower(regexp_replace(btrim(subject_name), '[[:space:]]+', ' ', 'g'))
    from (
      select unnest(coalesce(new.required_subjects, '{}'::text[])) as subject_name
      union all
      select unnest(coalesce(new.alternative_subjects, '{}'::text[])) as subject_name
      union all
      select group_subject.value
      from jsonb_array_elements(coalesce(new.subject_group_rules, '[]'::jsonb)) as groups(rule)
      cross join lateral jsonb_array_elements_text(groups.rule -> 'subjects') as group_subject(value)
    ) selected
  loop
    if requested_subject in ('english language', 'use of english') then
      raise exception 'English Language is compulsory and must not be repeated among the three remaining UTME subjects.'
        using errcode = '23514';
    end if;

    if not exists (
      select 1
      from public.upec_subject_library library
      join public.upec_exam_subject_catalogue catalogue
        on catalogue.subject_id = library.id
      where library.normalized_name = requested_subject
        and catalogue.exam_type = 'jamb_utme'
        and catalogue.exam_year = new.exam_year
        and catalogue.active = true
        and (not new.source_verified or catalogue.source_verified = true)
    ) then
      raise exception 'JAMB subject "%" is not an active catalogue option for year % or is not source-verified.',
        requested_subject, new.exam_year
        using errcode = '23514';
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists upec_jamb_combination_subject_catalogue_guard
  on public.upec_jamb_utme_combinations;

create trigger upec_jamb_combination_subject_catalogue_guard
before insert or update of exam_year, required_subjects, alternative_subjects,
  subject_group_rules, source_verified, active
on public.upec_jamb_utme_combinations
for each row
execute function public.upec_validate_jamb_utme_combination_subject_catalogue();

revoke all on function public.upec_validate_jamb_utme_combination_subject_catalogue()
  from public, anon, authenticated;
