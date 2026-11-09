# JAMB UTME subject catalogue

## Authoritative source

The catalogue is based on the official JAMB Integrated Brochure and Syllabus System (IBASS) eligibility checker:

- https://eligibility.jamb.gov.ng/

The live checker asks candidates to select entry mode, institution type/category, institution and programme before evaluating eligibility. Its UTME section explicitly says English Language is already selected by default. It displays the selectable UTME subjects in that section.

## 2027 selectable subject options

The shared subject library now has the 23 selectable subjects displayed by the checker:

Agriculture; Arabic; Art; Biology; Chemistry; Christian Religious Studies; Commerce; Economics; English Language; French; Geography; Government; Hausa Language; History; Home Economics; Igbo Language; Islamic Religious Studies; Literature in English; Mathematics; Music; Physics; Principles of Accounts; Yoruba Language.

English Language is classified as compulsory. The other 22 are catalogue options, not universally required subjects.

## Combination modelling

JAMB combinations are stored separately in `upec_jamb_utme_combinations`, not in the WAEC/NECO field-of-study selection framework. A combination is keyed by examination year, institution and programme/course. It records:

- institution and programme names, with optional institution/programme codes;
- English Language as a required, preselected subject;
- exactly three additional required subjects, or a supported required/alternative-subject split;
- structured subject-group alternatives, explanatory notes and source reference;
- source verification and active status.

No institution/course combination has been seeded as verified. The public IBASS page is dynamic and requires selecting the exact institution and programme. Do not infer combinations from a department, degree title, another institution, or a past-year combination. Add and verify each rule only after checking the exact IBASS record for the applicable year.

## API

Mounted under the academic router:

- `GET /academic/exams/subjects?examType=jamb_utme&year=2027` — shared subject options.
- `GET /academic/jamb/combinations?year=2027&institution=...&programme=...` — course-specific rules and filters.
- `POST /academic/jamb/combinations` — admin creates a provisional rule; API enforces English Language and three additional subject slots and always saves it unverified.
- `PATCH /academic/jamb/combinations/:id` — admin updates an existing rule; any edit clears previous verification evidence and returns the rule to provisional status.
- `POST /academic/jamb/combinations/:id/verify` — admin/super-admin records a source review only after confirming the exact saved year, institution, programme and subject set. It accepts HTTPS URLs on official JAMB domains, requires meaningful review notes and a signed-in staff identity.
- `GET /admissions/jamb/catalogue?year=2027&institution=...&programme=...` — student-only lookup. It returns only active, source-verified institution/course combinations; omit institution to list verified institutions or omit programme to list that institution's verified programmes.

The student JAMB past-question page now includes a separate UTME subject-combination checker. It requires an exact institution and programme, queries the student-only endpoint, displays only individually verified rules and links back to official IBASS when no verified rule is recorded. It never substitutes another course or institution's combination.

The admin form accepts three remaining UTME subject slots as fixed required subjects, alternative-subject choices, and structured IBASS subject groups (`name`, `subjects`, `choose`). Group `choose` counts contribute to the three remaining slots. Verification records the exact checked group structure in `verified_subject_group_rules`; changing the group structure invalidates prior verification. New entries are always provisional. Admins can edit provisional entries and open an inline IBASS verification form; a verified entry displays its check date and review notes. Editing any verified rule invalidates its previous verification.

The combination list is available to academic staff roles; writes are admin/super-admin only. The IJMB subject-code constraint remains limited to IJMB.

## Migrations

- `20261108_jamb_utme_combination_catalogue.sql` — combination table, indexes, RLS and initial subject catalogue.
- `20261107_complete_jamb_utme_subject_options.sql` — idempotent completion of the IBASS selectable subject list.
- `20261108_jamb_source_verification_workflow.sql` — verification evidence, staff attribution and database consistency checks.

All three JAMB migrations were applied to the connected Supabase project. The admin Academic Catalogue includes a JAMB-specific provisional combination manager and links directly to IBASS.

## Verification gaps

- 2027 selectable subject names and English Language preselection: checked against the live official IBASS page.
- Institution/course combinations: not yet populated or verified; each requires an exact institution and programme selection in IBASS.
- The IBASS page is dynamic and may change by year; retain the exact year and source reference with every future rule.
- Verification is an accountable staff attestation to the official IBASS record; the API does not scrape the interactive checker or independently prove the human comparison. Keep the verification notes precise and retain the official source URL.


## Subject-group verification update (9 November 2026)

- `verified_subject_group_rules` stores the exact IBASS-checked subject-group structure separately from the provisional `subject_group_rules`.
- Group choices count toward the three remaining UTME subject slots; they are not treated as extra subjects.
- The API validates group names, unique group labels, subject lists and choose counts, and requires exact group evidence before verification.
- The database guard checks each group subject against the active year-specific JAMB subject catalogue and requires verified group evidence to match the saved rule.
- No institution/course records were added by this change. All 2027 subject options remain distinct from institution/course combinations.
