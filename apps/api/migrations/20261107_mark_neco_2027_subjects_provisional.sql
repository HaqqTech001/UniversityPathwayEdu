-- The official NECO 2027 page confirms the total and selection framework,
-- but the linked 2027 registration PDF must be checked for the exact subject
-- names. Do not present the provisional subject names as verified.
update public.upec_exam_subject_catalogue
set source_verified=false,
    source_reference='PROVISIONAL: NECO 2027 SSCE Internal category framework; awaiting direct reconciliation with the 2027 Registration Guidelines PDF. https://neco.gov.ng/exams/ssce-internal'
where exam_type='neco_ssce' and exam_year=2027;
update public.upec_exam_selection_rules
set source_verified=false,
    source_reference='NECO 2027 SSCE Internal official framework https://neco.gov.ng/exams/ssce-internal; 2026 SSCE Internal User Guide (prior-year detail only) https://neco.gov.ng/SSCE%20Internal%20User%20Guide.pdf. Confirm exact fourth compulsory subject and trade selection against 2027 PDF.'
where exam_type='neco_ssce' and exam_year=2027;