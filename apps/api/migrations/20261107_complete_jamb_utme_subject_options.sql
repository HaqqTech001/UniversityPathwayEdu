-- Complete the UTME subject options against the live JAMB IBASS checker.
-- IBASS explicitly states English Language is selected by default and lists the selectable options.
with subjects(name,family,category,selection) as (
 values
 ('English Language','language','language','compulsory'),
 ('Agriculture','science','science','catalogue_option'),
 ('Arabic','language','language','catalogue_option'),
 ('Art','humanities','humanities','catalogue_option'),
 ('Biology','science','science','catalogue_option'),
 ('Chemistry','science','science','catalogue_option'),
 ('Christian Religious Studies','humanities','humanities','catalogue_option'),
 ('Commerce','business','business_studies','catalogue_option'),
 ('Economics','business','business_studies','catalogue_option'),
 ('French','language','language','catalogue_option'),
 ('Geography','humanities','humanities','catalogue_option'),
 ('Government','humanities','humanities','catalogue_option'),
 ('Hausa Language','language','language','catalogue_option'),
 ('History','humanities','humanities','catalogue_option'),
 ('Home Economics','vocational','vocational','catalogue_option'),
 ('Igbo Language','language','language','catalogue_option'),
 ('Islamic Religious Studies','humanities','humanities','catalogue_option'),
 ('Literature in English','humanities','humanities','catalogue_option'),
 ('Mathematics','mathematics','mathematics','catalogue_option'),
 ('Music','humanities','humanities','catalogue_option'),
 ('Physics','science','science','catalogue_option'),
 ('Principles of Accounts','business','business_studies','catalogue_option'),
 ('Yoruba Language','language','language','catalogue_option')
)
insert into public.upec_subject_library(canonical_name,subject_family)
select name,family from subjects
on conflict(normalized_name) do update set subject_family=excluded.subject_family,updated_at=now();

with subjects(name,category,selection) as (
 values
 ('English Language','language','compulsory'),
 ('Agriculture','science','catalogue_option'),
 ('Arabic','language','catalogue_option'),
 ('Art','humanities','catalogue_option'),
 ('Biology','science','catalogue_option'),
 ('Chemistry','science','catalogue_option'),
 ('Christian Religious Studies','humanities','catalogue_option'),
 ('Commerce','business_studies','catalogue_option'),
 ('Economics','business_studies','catalogue_option'),
 ('French','language','catalogue_option'),
 ('Geography','humanities','catalogue_option'),
 ('Government','humanities','catalogue_option'),
 ('Hausa Language','language','catalogue_option'),
 ('History','humanities','catalogue_option'),
 ('Home Economics','vocational','catalogue_option'),
 ('Igbo Language','language','catalogue_option'),
 ('Islamic Religious Studies','humanities','catalogue_option'),
 ('Literature in English','humanities','catalogue_option'),
 ('Mathematics','mathematics','catalogue_option'),
 ('Music','humanities','catalogue_option'),
 ('Physics','science','catalogue_option'),
 ('Principles of Accounts','business_studies','catalogue_option'),
 ('Yoruba Language','language','catalogue_option')
)
insert into public.upec_exam_subject_catalogue(exam_type,exam_year,subject_id,field_of_study,subject_category,selection_type,source_reference,source_verified,active)
select 'jamb_utme',2027,l.id,'general',s.category,s.selection,'JAMB IBASS eligibility checker — UTME subject selection; English Language selected by default. https://eligibility.jamb.gov.ng/',true,true
from subjects s join public.upec_subject_library l on l.normalized_name=lower(regexp_replace(trim(s.name),'\s+',' ','g'))
where not exists(select 1 from public.upec_exam_subject_catalogue c where c.exam_type='jamb_utme' and c.exam_year=2027 and c.subject_id=l.id);
