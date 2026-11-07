-- Reconcile the NECO 2027 catalogue without presenting inferred details as verified.
-- The 2027 NECO page confirms 38 subjects and the 4 + 3/4 + 1 structure.
-- Prior-year NECO registration guidance identifies English, Mathematics and
-- Civic Education as auto-selected and requires at least one Trade subject.
-- The 2027 guide must still confirm exact adoption and the fourth core subject.
update public.upec_subject_library
set canonical_name='Citizenship and Heritage Studies',
    subject_family='humanities',
    updated_at=now()
where normalized_name='civic education';

update public.upec_subject_library
set canonical_name='Digital Technologies',
    subject_family='technology',
    updated_at=now()
where normalized_name='computer studies';

update public.upec_exam_subject_catalogue c
set field_of_study='general',
    subject_category='general',
    selection_type='compulsory',
    source_verified=false,
    source_reference='PROVISIONAL: NERDC revised Senior Secondary Curriculum Offering; NECO 2027 adoption awaits direct confirmation in the 2027 registration guidelines.'
from public.upec_subject_library l
where c.subject_id=l.id
  and c.exam_type='neco_ssce'
  and c.exam_year=2027
  and l.normalized_name in ('citizenship and heritage studies','digital technologies');

update public.upec_exam_subject_catalogue c
set source_verified=false,
    source_reference='PROVISIONAL: NECO 2027 subject framework; exact subject names and classification await direct reconciliation with the official 2027 registration guidelines.'
where c.exam_type='neco_ssce'
  and c.exam_year=2027;

update public.upec_exam_selection_rules
set rule_definition=jsonb_build_object(
  'neco_2027_published_framework',jsonb_build_object(
    'cross_cutting_compulsory_count',4,
    'specialisation_subjects_min',3,
    'specialisation_subjects_max',4,
    'outside_field_electives',1,
    'total_subjects_min',8,
    'total_subjects_max',9
  ),
  'prior_year_registration_guidance',jsonb_build_object(
    'auto_selected_subjects',['English Language','General Mathematics','Civic Education'],
    'trade_subject_minimum',1,
    'note','Prior-year guidance only; do not enforce as confirmed 2027 rule until the 2027 registration guide is checked.'
  ),
  'nerdc_revised_senior_secondary_core',jsonb_build_object(
    'core_subjects',['English Language','General Mathematics','One Trade subject','Citizenship and Heritage Studies','Digital Technologies'],
    'source','NERDC Senior Secondary Curriculum Offering',
    'note','Curriculum core is not automatically equivalent to NECO examination registration requirements.'
  ),
  'subject_selection',jsonb_build_object(
    'science',['Agricultural Science','Biology','Chemistry','Foods & Nutrition','Further Mathematics','Geography','Health Education','Physical Education','Physics','Technical Drawing'],
    'commercial',['Accounting','Commerce','Economics','Marketing'],
    'arts',['Arabic','Catering Craft','Christian Religious Studies','French','Government','Hausa','Home Management','Igbo','Islamic Studies','Literature-in-English','Music','Nigerian History','Visual Art','Yoruba'],
    'trade',['Beauty and Cosmetology','Computer Hardware and GSM Repairs','Fashion Design and Garment Making','Horticulture and Crop Production','Livestock Farming','Solar Photovoltaic Installation and Maintenance']
  ),
  'reconciliation_status','NECO 2027 counts are published. Exact four compulsory subject names and subject-level registration eligibility remain provisional pending direct confirmation from the official 2027 registration guidelines.'
),
source_verified=false,
source_reference='NECO 2027 SSCE Internal: https://neco.gov.ng/exams/ssce-internal; prior-year NECO SSCE Internal User Guide: https://neco.gov.ng/SSCE%20Internal%20User%20Guide.pdf; NERDC Senior Secondary Curriculum Offering.',
updated_at=now()
where exam_type='neco_ssce'
  and exam_year=2027
  and field_of_study='general'
  and institution_name is null
  and programme_name is null;
