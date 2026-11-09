-- Bind every UTME combination to an institution and an institution-specific programme row.
alter table public.upec_jamb_utme_combinations
 add column if not exists institution_id uuid references public.upec_jamb_institutions(id) on delete restrict,
 add column if not exists programme_id uuid references public.upec_jamb_programmes(id) on delete restrict;
update public.upec_jamb_utme_combinations c
set institution_id=i.id, programme_id=p.id
from public.upec_jamb_institutions i
join public.upec_jamb_programmes p on p.institution_id=i.id
where c.institution_id is null
 and lower(trim(c.institution_name))=lower(trim(i.institution_name))
 and lower(trim(c.programme_name))=lower(trim(p.programme_name))
 and c.exam_year=p.exam_year;
create index if not exists upec_jamb_combinations_institution_year_idx
 on public.upec_jamb_utme_combinations(institution_id,exam_year);
create index if not exists upec_jamb_combinations_programme_year_idx
 on public.upec_jamb_utme_combinations(programme_id,exam_year);
comment on column public.upec_jamb_utme_combinations.institution_id is 'FK to the institution directory; required for newly created combinations.';
comment on column public.upec_jamb_utme_combinations.programme_id is 'FK to the institution- and year-specific JAMB programme directory; required for newly created combinations.';
