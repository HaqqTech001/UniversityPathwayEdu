-- NECO's official 2027 SSCE Internal page publishes the selection framework.
-- The four cross-cutting subject names are not populated until the official
-- registration guideline's subject list is checked directly.
insert into public.upec_exam_selection_rules(exam_type,exam_year,field_of_study,minimum_subjects,maximum_subjects,rule_definition,source_reference,source_verified,active)
select 'neco_ssce',2027,'general',8,9,
'{"cross_cutting_compulsory_count":4,"specialisation_subjects_min":3,"specialisation_subjects_max":4,"outside_field_electives":1,"total_subjects_min":8,"total_subjects_max":9,"cross_cutting_subject_names_pending_official_guideline_review":true}'::jsonb,
'NECO SSCE Internal 2027 official examination page: https://neco.gov.ng/exams/ssce-internal',true,true
where not exists(select 1 from public.upec_exam_selection_rules where exam_type='neco_ssce' and exam_year=2027 and field_of_study='general' and institution_name is null and programme_name is null);