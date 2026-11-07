alter table public.upec_exam_subject_catalogue drop constraint if exists upec_exam_subject_catalogue_selection_type_check;
alter table public.upec_exam_subject_catalogue add constraint upec_exam_subject_selection_type_check check(selection_type in ('compulsory','required_choice','departmental_core','departmental_optional','outside_field_elective','programme_required','institution_specific'));

with subjects(canonical_name,subject_family,field_of_study,subject_category,selection_type) as (values
 ('Civic Education','general','general','general','compulsory'),
 ('English Language','language','general','language','compulsory'),
 ('General Mathematics','mathematics','general','mathematics','compulsory'),
 ('Agricultural Science','science','science','science','departmental_optional'),
 ('Biology','science','science','science','departmental_optional'),
 ('Chemistry','science','science','science','departmental_optional'),
 ('Computer Studies','technology','science','technology','departmental_optional'),
 ('Foods & Nutrition','general','science','general','departmental_optional'),
 ('Further Mathematics','mathematics','science','mathematics','departmental_optional'),
 ('Geography','humanities','science','humanities','departmental_optional'),
 ('Health Education','general','science','general','departmental_optional'),
 ('Physical Education','general','science','general','departmental_optional'),
 ('Physics','science','science','science','departmental_optional'),
 ('Technical Drawing','technology','science','technology','departmental_optional'),
 ('Accounting','business','commercial','business_studies','departmental_optional'),
 ('Commerce','business','commercial','business_studies','departmental_optional'),
 ('Economics','business','commercial','business_studies','departmental_optional'),
 ('Marketing','business','commercial','business_studies','departmental_optional'),
 ('Arabic','language','arts','language','departmental_optional'),
 ('Catering Craft','vocational','arts','vocational','departmental_optional'),
 ('Christian Religious Studies','humanities','arts','humanities','departmental_optional'),
 ('French','language','arts','language','departmental_optional'),
 ('Government','humanities','arts','humanities','departmental_optional'),
 ('Hausa','language','arts','language','departmental_optional'),
 ('Home Management','general','arts','general','departmental_optional'),
 ('Igbo','language','arts','language','departmental_optional'),
 ('Islamic Studies','humanities','arts','humanities','departmental_optional'),
 ('Literature-in-English','humanities','arts','humanities','departmental_optional'),
 ('Music','humanities','arts','humanities','departmental_optional'),
 ('Nigerian History','humanities','arts','humanities','departmental_optional'),
 ('Visual Art','humanities','arts','humanities','departmental_optional'),
 ('Yoruba','language','arts','language','departmental_optional'),
 ('Beauty and Cosmetology','vocational','trade','vocational','required_choice'),
 ('Computer Hardware and GSM Repairs','technology','trade','technology','required_choice'),
 ('Fashion Design and Garment Making','vocational','trade','vocational','required_choice'),
 ('Horticulture and Crop Production','vocational','trade','vocational','required_choice'),
 ('Livestock Farming','vocational','trade','vocational','required_choice'),
 ('Solar Photovoltaic Installation and Maintenance','technology','trade','technology','required_choice')
)
insert into public.upec_subject_library(canonical_name,subject_family)
select canonical_name,subject_family from subjects
on conflict(normalized_name) do update set subject_family=excluded.subject_family,updated_at=now();

with subjects(canonical_name,field_of_study,subject_category,selection_type) as (values
 ('Civic Education','general','general','compulsory'),('English Language','general','language','compulsory'),('General Mathematics','general','mathematics','compulsory'),
 ('Agricultural Science','science','science','departmental_optional'),('Biology','science','science','departmental_optional'),('Chemistry','science','science','departmental_optional'),('Computer Studies','science','technology','departmental_optional'),('Foods & Nutrition','science','general','departmental_optional'),('Further Mathematics','science','mathematics','departmental_optional'),('Geography','science','humanities','departmental_optional'),('Health Education','science','general','departmental_optional'),('Physical Education','science','general','departmental_optional'),('Physics','science','science','departmental_optional'),('Technical Drawing','science','technology','departmental_optional'),
 ('Accounting','commercial','business_studies','departmental_optional'),('Commerce','commercial','business_studies','departmental_optional'),('Economics','commercial','business_studies','departmental_optional'),('Marketing','commercial','business_studies','departmental_optional'),
 ('Arabic','arts','language','departmental_optional'),('Catering Craft','arts','vocational','departmental_optional'),('Christian Religious Studies','arts','humanities','departmental_optional'),('French','arts','language','departmental_optional'),('Government','arts','humanities','departmental_optional'),('Hausa','arts','language','departmental_optional'),('Home Management','arts','general','departmental_optional'),('Igbo','arts','language','departmental_optional'),('Islamic Studies','arts','humanities','departmental_optional'),('Literature-in-English','arts','humanities','departmental_optional'),('Music','arts','humanities','departmental_optional'),('Nigerian History','arts','humanities','departmental_optional'),('Visual Art','arts','humanities','departmental_optional'),('Yoruba','arts','language','departmental_optional'),
 ('Beauty and Cosmetology','trade','vocational','required_choice'),('Computer Hardware and GSM Repairs','trade','technology','required_choice'),('Fashion Design and Garment Making','trade','vocational','required_choice'),('Horticulture and Crop Production','trade','vocational','required_choice'),('Livestock Farming','trade','vocational','required_choice'),('Solar Photovoltaic Installation and Maintenance','trade','technology','required_choice')
)
insert into public.upec_exam_subject_catalogue(exam_type,exam_year,subject_id,field_of_study,subject_category,selection_type,source_reference,source_verified,active)
select 'neco_ssce',2027,l.id,s.field_of_study,s.subject_category,s.selection_type,
'NECO SSCE Internal 2027 subject categories; official NECO 2026 SSCE timetable and user guide; NERDC National Policy on Senior Secondary Education',true,true
from subjects s join public.upec_subject_library l on l.normalized_name=lower(regexp_replace(trim(s.canonical_name),'[[:space:]]+',' ','g'))
where not exists(select 1 from public.upec_exam_subject_catalogue x where x.exam_type='neco_ssce' and x.exam_year=2027 and x.subject_id=l.id and x.institution_name is null and x.programme_name is null);

update public.upec_exam_selection_rules
set rule_definition='{"mandatory_subjects":["English Language","General Mathematics","Civic Education"],"required_trade_choice":{"choose_exactly":1,"selection_type":"required_choice","field_of_study":"trade","subjects":["Beauty and Cosmetology","Computer Hardware and GSM Repairs","Fashion Design and Garment Making","Horticulture and Crop Production","Livestock Farming","Solar Photovoltaic Installation and Maintenance"]},"specialisation_subjects":{"minimum":3,"maximum":4,"fields":["science","arts","commercial","technology"]},"outside_specialisation_electives":1,"total_subjects":{"minimum":8,"maximum":9},"source_note":"NECO page specifies four cross-cutting compulsory subjects; official NECO user guide identifies English, Mathematics and Civic Education as auto-selected and requires at least one Trade subject. The fourth compulsory choice is one Trade subject."}'::jsonb,
source_reference='NECO 2027 SSCE Internal official page https://neco.gov.ng/exams/ssce-internal; NECO SSCE Internal User Guide https://neco.gov.ng/SSCE%20Internal%20User%20Guide.pdf; NERDC National Policy on Senior Secondary Education https://nssec.gov.ng/wp-content/uploads/2025/06/NATIONAL-POLICY-on-Sen-Sec-Edu.pdf',
source_verified=true,updated_at=now()
where exam_type='neco_ssce' and exam_year=2027 and field_of_study='general' and institution_name is null and programme_name is null;