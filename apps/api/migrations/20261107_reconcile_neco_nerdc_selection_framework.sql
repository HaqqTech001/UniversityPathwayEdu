update public.upec_exam_selection_rules
set rule_definition='{
 "neco_2027_published_framework":{
   "cross_cutting_compulsory_count":4,
   "specialisation_subjects_min":3,
   "specialisation_subjects_max":4,
   "outside_field_electives":1,
   "total_subjects_min":8,
   "total_subjects_max":9
 },
 "nerdc_revised_senior_secondary_core":{
   "core_subjects":["English Language","General Mathematics","One Trade subject","Citizenship and Heritage Studies","Digital Technologies"],
   "source":"NERDC Senior Secondary Curriculum Offering"
 },
 "field_selection":{
   "science":["Agricultural Science","Biology","Chemistry","Foods & Nutrition","Further Mathematics","Geography","Health Education","Physical Education","Physics","Technical Drawing"],
   "humanities":["Nigerian History","Government","Christian Religious Studies","Islamic Studies","One Nigerian language","French","Arabic","Visual Arts","Music","Literature-in-English","Home Management","Catering Craft"],
   "business":["Accounting","Commerce","Marketing","Economics"]
 },
 "trade_subjects":["Solar Photovoltaic Installation and Maintenance","Fashion Design and Garment Making","Livestock Farming","Beauty and Cosmetology","Computer Hardware and GSM Repairs","Horticulture and Crop Production"],
 "nigerian_language_choice_max":1,
 "reconciliation_status":"Pending direct confirmation of how the NECO 2027 four cross-cutting requirement maps to the NERDC five core-and-compulsory curriculum subjects. Do not enforce an assumed compulsory-subject list until the NECO 2027 registration PDF is reconciled."
}'::jsonb,
source_verified=false,
source_reference='NECO 2027 SSCE Internal framework https://neco.gov.ng/exams/ssce-internal; NERDC Senior Secondary Curriculum Offering https://nerdc.gov.ng/content_manager/Basic%20and%20Senior%20Secondary%20Education%20Curriculum%20Offerings.pdf; exact NECO subject/compulsory reconciliation pending 2027 guidelines.',
updated_at=now()
where exam_type='neco_ssce' and exam_year=2027 and field_of_study='general' and institution_name is null and programme_name is null;