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


## Catalogue administration and validation hardening (9 November 2026)

- The admin JAMB list supports local filters by institution, programme/course and verification status, with visible counts for the loaded records.
- API validation requires the number of alternative subjects to satisfy the configured alternative choice count.
- A subject cannot appear more than once across fixed required subjects, alternatives, or any subject-group option. This prevents a duplicated subject from being counted as two different UTME slots.
- These checks do not create or verify any institution/course combinations. The connected database currently contains no JAMB combination records.


## Institution and programme directory (9 November 2026)

The JAMB directory is deliberately separate from verified UTME combinations:

- `upec_jamb_institutions` stores institution identity, type, state, official IBASS source, source-check evidence and active status.
- `upec_jamb_programmes` stores institution-linked programme names by examination year, with independent source references and verification status.
- Directory discovery does not imply that a programme's UTME combination has been verified.
- New institutions and programmes entered through the admin API remain provisional. No combination is created automatically.
- Staff discovery endpoint: `GET /academic/jamb/directory?year=2027`.
- Admin creation endpoints: `POST /academic/jamb/directory/institutions` and `POST /academic/jamb/directory/programmes`.

The first four institution identities were seeded from individual official IBASS brochure institution pages: Admiralty University of Nigeria, University of Benin, Greenfield University and Osun State University. Their institution identity is source-verified; no programme-year rows or subject combinations were inferred from the institution listings.

Official references:
- [JAMB IBASS eligibility checker](https://eligibility.jamb.gov.ng/)
- [JAMB official FAQ, question 7](https://www.jamb.gov.ng/FAQ)
- [Admiralty University IBASS listing](https://ibass.jamb.gov.ng/brochure-courses?id=21&school=ADMIRALTY+UNIVERSITY+OF+NIGERIA%2C+IBUSA%2C+DELTA+STATE)
- [University of Benin IBASS listing](https://ibass.jamb.gov.ng/brochure-courses?id=101&school=UNIVERSITY+OF+BENIN%2C+BENIN+CITY%2C+EDO+STATE)
- [Greenfield University IBASS listing](https://ibass.jamb.gov.ng/brochure-courses?id=371&school=GREENFIELD+UNIVERSITY%2C+KASARAMI%2C+KADUNA+STATE)
- [Osun State University IBASS listing](https://ibass.jamb.gov.ng/brochure-courses?id=798&school=OSUN+STATE+UNIVERSITY%2C+OSOGBO%2C+OSUN+STATE)

Programme rows remain empty until the applicable admission-year listing is confirmed and entered. The IBASS brochure is updated and institution/course availability must be rechecked for each year.


## Programme discovery and independent verification (9 November 2026)

- Added 15 provisional programme discovery rows for three institutions (five each for University of Benin, Greenfield University and Osun State University), based on course listings associated with their official IBASS institution pages.
- These records are stored with `source_verified=false`. The source pages establish programme discovery only; they do not, in the evidence currently captured, establish 2027 availability. Do not use these rows as proof of 2027 admission availability or subject combinations.
- No programme records were seeded for Admiralty University in this increment because a sufficiently clear course list was not independently confirmed.
- Added `PATCH /academic/jamb/directory/programmes/:id/verify`. It accepts evidence only when the institution ID, programme name and year match the saved row, the URL is an HTTPS `ibass.jamb.gov.ng/brochure-courses` page, and the reviewer records meaningful notes.
- Programme verification is separate from the later UTME subject-combination verification. Marking a programme listing verified must not automatically verify its UTME subjects.
- Admin programme cards now expose a verification form for provisional rows.

Database state after this increment: 4 institution identities (4 verified), 15 programme discovery rows (0 verified), and 0 UTME combinations. All 15 programme rows remain provisional pending admission-year confirmation.
