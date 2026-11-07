-- Reconcile the NECO 2027 framework without overstating prior-year evidence.
-- NECO's 2027 page confirms four cross-cutting compulsory subjects and the
-- 8-9 total / 3-4 specialisation / one outside-field structure. The 2026
-- registration user guide only confirms three auto-selected subjects and at
-- least one Trade subject; do not silently promote that prior-year detail to
-- a verified 2027 rule until the linked 2027 PDF is inspected.
update public.upec_exam_selection_rules
set rule_definition = jsonb_build_object(
  'neco_2027_published_framework', jsonb_build_object(
    'cross_cutting_compulsory_count', 4,
    'specialisation_subjects_min', 3,
    'specialisation_subjects_max', 4,
    'outside_field_electives', 1,
    'total_subjects_min', 8,
    'total_subjects_max', 9
  ),
  'prior_year_registration_guide_reference', jsonb_build_object(
    'guide_year', 2026,
    'auto_selected_subjects', jsonb_build_array('English Language','General Mathematics','Civic Education'),
    'additional_trade_subject_minimum', 1,
    'status', 'Prior-year guidance only; not yet confirmed as the exact 2027 registration rule'
  ),
  'nerdc_revised_senior_secondary_core', jsonb_build_object(
    'core_subjects', jsonb_build_array(
      'English Language','General Mathematics','One Trade subject',
      'Citizenship and Heritage Studies','Digital Technologies'
    ),
    'source', 'NERDC Senior Secondary Curriculum Offering',
    'status', 'Curriculum reference; exact NECO 2027 registration mapping remains unconfirmed'
  ),
  'trade_subjects', jsonb_build_array(
    'Beauty and Cosmetology',
    'Computer Hardware and GSM Repairs',
    'Fashion Design and Garment Making',
    'Horticulture and Crop Production',
    'Livestock Farming',
    'Solar Photovoltaic Installation and Maintenance'
  ),
  'field_selection', jsonb_build_object(
    'science', jsonb_build_array(
      'Agricultural Science','Biology','Chemistry','Computer Studies',
      'Foods & Nutrition','Further Mathematics','Geography','Health Education',
      'Physical Education','Physics','Technical Drawing'
    ),
    'commercial', jsonb_build_array('Accounting','Commerce','Economics','Marketing'),
    'arts', jsonb_build_array(
      'Arabic','Catering Craft','Christian Religious Studies','French',
      'Government','Hausa','Home Management','Igbo','Islamic Studies',
      'Literature-in-English','Music','Nigerian History','Visual Art','Yoruba'
    )
  ),
  'reconciliation_status',
    'The 2027 NECO page confirms four compulsory cross-cutting subjects but does not name them in its readable page text. The 2026 NECO guide identifies English Language, General Mathematics and Civic Education as auto-selected and requires at least one Trade subject. NERDC lists five revised curriculum core subjects. Keep all 2027 subject names and the precise fourth compulsory mapping provisional until the 2027 registration PDF is directly reviewed.'
),
source_reference = 'NECO SSCE Internal 2027 official page https://neco.gov.ng/exams/ssce-internal; NECO 2026 SSCE Internal Registration Guidelines https://neco.gov.ng/2026%20GUIDELINES.pdf; NECO SSCE Internal User Guide https://neco.gov.ng/SSCE%20Internal%20User%20Guide.pdf; NERDC Senior Secondary Curriculum Offering https://nerdc.gov.ng/content_manager/Basic%20and%20Senior%20Secondary%20Education%20Curriculum%20Offerings.pdf',
source_verified = false,
updated_at = now()
where exam_type='neco_ssce'
  and exam_year=2027
  and field_of_study='general'
  and institution_name is null
  and programme_name is null;

update public.upec_exam_subject_catalogue
set source_verified = false,
    source_reference = 'PROVISIONAL NECO 2027 subject catalogue. NECO 2027 official page confirms 38 subjects and the selection framework; exact subject names/codes and the four compulsory names require direct verification against the linked 2027 Registration Guidelines PDF. https://neco.gov.ng/exams/ssce-internal'
where exam_type='neco_ssce' and exam_year=2027;
