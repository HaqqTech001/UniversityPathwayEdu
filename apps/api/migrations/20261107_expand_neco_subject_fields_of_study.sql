-- Align NECO catalogue fields with the four curriculum pathways while retaining general/trade.
alter table public.upec_neco_subject_catalogue
 drop constraint if exists upec_neco_subject_catalogue_field_of_study_check;
alter table public.upec_neco_subject_catalogue
 add constraint upec_neco_subject_catalogue_field_of_study_check
 check(field_of_study in ('general','science','humanities','technology','business','trade'));
