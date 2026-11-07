-- Align the provisional NECO 2027 catalogue names with the revised NERDC
-- senior-secondary subject offering. The source flag remains false pending
-- direct reconciliation with the NECO 2027 registration PDF.
update public.upec_subject_library
set canonical_name='Citizenship and Heritage Studies',subject_family='humanities',updated_at=now()
where normalized_name='civic education';
update public.upec_subject_library
set canonical_name='Digital Technologies',subject_family='technology',updated_at=now()
where normalized_name='computer studies';
update public.upec_exam_subject_catalogue c
set field_of_study='general',subject_category='general',selection_type='compulsory',
    source_verified=false,
    source_reference='PROVISIONAL: NERDC Senior Secondary Curriculum Offering; confirm exact NECO 2027 adoption in NECO Registration Guidelines PDF. https://nerdc.gov.ng/content_manager/Basic%20and%20Senior%20Secondary%20Education%20Curriculum%20Offerings.pdf'
from public.upec_subject_library l
where c.subject_id=l.id and c.exam_type='neco_ssce' and c.exam_year=2027
and l.normalized_name in ('citizenship and heritage studies','digital technologies');
update public.upec_exam_selection_rules
set rule_definition=jsonb_set(rule_definition,'{cross_cutting_compulsory_subject_names_pending_official_guideline_review}','true'::jsonb,true),
    source_verified=false,
    source_reference='NECO 2027 SSCE Internal official framework https://neco.gov.ng/exams/ssce-internal; NERDC Senior Secondary Curriculum Offering https://nerdc.gov.ng/content_manager/Basic%20and%20Senior%20Secondary%20Education%20Curriculum%20Offerings.pdf. Resolve NECO 4 cross-cutting vs NERDC 5 core-and-compulsory subjects against the 2027 NECO PDF.'
where exam_type='neco_ssce' and exam_year=2027 and field_of_study='general' and institution_name is null and programme_name is null;