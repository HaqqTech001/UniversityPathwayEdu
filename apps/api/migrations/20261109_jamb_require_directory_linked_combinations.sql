-- Enforce directory linkage for all newly stored UTME combinations.
-- The preceding audit confirmed there are currently no legacy rows to backfill.
alter table public.upec_jamb_utme_combinations
 alter column institution_id set not null,
 alter column programme_id set not null;
create unique index if not exists upec_jamb_combinations_directory_year_uidx
 on public.upec_jamb_utme_combinations(institution_id,programme_id,exam_year);
