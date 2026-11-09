create or replace function public.upec_jamb_subject_group_slot_count(groups jsonb)
returns integer
language sql
immutable
parallel safe
set search_path = public, pg_temp
as $$
  select coalesce(sum((item->>'choose')::integer),0)::integer
  from jsonb_array_elements(coalesce(groups,'[]'::jsonb)) item;
$$;

alter table public.upec_jamb_utme_combinations
  add column if not exists verified_subject_group_rules jsonb not null default '[]'::jsonb;

alter table public.upec_jamb_utme_combinations
  drop constraint if exists upec_jamb_verification_evidence_check;

alter table public.upec_jamb_utme_combinations
  add constraint upec_jamb_verification_evidence_check check (
    (source_verified=false and source_checked_at is null and source_verified_by is null)
    or
    (source_verified=true and source_checked_at is not null and source_verified_by is not null
     and length(trim(verification_notes))>=20
     and cardinality(verified_required_subjects)+alternative_subject_count+
       public.upec_jamb_subject_group_slot_count(verified_subject_group_rules)=3
     and verified_required_subjects=required_subjects
     and verified_alternative_subjects=alternative_subjects
     and verified_subject_group_rules=subject_group_rules)
  );

create or replace function public.upec_validate_jamb_utme_combination_subject_catalogue()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare requested_subject text;
begin
  if new.source_verified and not new.active then
    raise exception 'An inactive JAMB combination cannot remain source-verified.' using errcode='23514';
  end if;
  if not new.active then return new; end if;
  if jsonb_typeof(coalesce(new.subject_group_rules,'[]'::jsonb)) <> 'array' then
    raise exception 'JAMB subject group rules must be an array.' using errcode='23514';
  end if;
  if exists (
    select 1 from jsonb_array_elements(coalesce(new.subject_group_rules,'[]'::jsonb)) groups(rule)
    where jsonb_typeof(groups.rule)<>'object'
       or jsonb_typeof(groups.rule->'subjects')<>'array'
       or jsonb_typeof(groups.rule->'choose')<>'number'
       or coalesce(groups.rule->>'name','')=''
       or (groups.rule->>'choose')::integer<1
       or (groups.rule->>'choose')::integer>jsonb_array_length(groups.rule->'subjects')
  ) then
    raise exception 'Each JAMB subject group needs a name, subject list and valid choose count.' using errcode='23514';
  end if;
  if new.source_verified and new.verified_subject_group_rules is distinct from new.subject_group_rules then
    raise exception 'Verified JAMB subject groups must match the exact saved subject groups.' using errcode='23514';
  end if;
  for requested_subject in
    select lower(regexp_replace(btrim(subject_name),'[[:space:]]+',' ','g'))
    from (
      select unnest(coalesce(new.required_subjects,'{}'::text[])) subject_name
      union all select unnest(coalesce(new.alternative_subjects,'{}'::text[]))
      union all
      select group_subject.value
      from jsonb_array_elements(coalesce(new.subject_group_rules,'[]'::jsonb)) groups(rule)
      cross join lateral jsonb_array_elements_text(groups.rule->'subjects') group_subject(value)
    ) selected
  loop
    if requested_subject in ('english language','use of english') then
      raise exception 'English Language is compulsory and must not be repeated among the three remaining UTME subjects.' using errcode='23514';
    end if;
    if not exists (
      select 1 from public.upec_subject_library library
      join public.upec_exam_subject_catalogue catalogue on catalogue.subject_id=library.id
      where library.normalized_name=requested_subject
        and catalogue.exam_type='jamb_utme' and catalogue.exam_year=new.exam_year
        and catalogue.active=true and (not new.source_verified or catalogue.source_verified=true)
    ) then
      raise exception 'JAMB subject "%" is not an active catalogue option for year % or is not source-verified.',requested_subject,new.exam_year using errcode='23514';
    end if;
  end loop;
  return new;
end;
$$;

drop trigger if exists upec_jamb_combination_subject_catalogue_guard on public.upec_jamb_utme_combinations;
create trigger upec_jamb_combination_subject_catalogue_guard
before insert or update of exam_year,required_subjects,alternative_subjects,subject_group_rules,source_verified,active,verified_subject_group_rules
on public.upec_jamb_utme_combinations
for each row execute function public.upec_validate_jamb_utme_combination_subject_catalogue();

revoke all on function public.upec_validate_jamb_utme_combination_subject_catalogue() from public,anon,authenticated;
revoke all on function public.upec_jamb_subject_group_slot_count(jsonb) from public,anon,authenticated;
