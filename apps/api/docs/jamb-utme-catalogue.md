# JAMB UTME subject catalogue

## Source model

The JAMB UTME option catalogue is a year-specific view over the shared `upec_subject_library`. It is separate from WAEC WASSCE, NECO SSCE and IJMB selection structures. IJMB subject/course codes remain in their existing programme-specific fields and are not JAMB subject identifiers.

Official sources:

- [JAMB IBASS eligibility checker](https://eligibility.jamb.gov.ng/) — selects entry mode, institution and programme; its UTME section states that English Language is already selected by default and exposes the selectable subject options.
- [JAMB CAPS and IBASS manuals](https://www.jamb.gov.ng/Speeches-Presentation/CAPS_and_IBASS_manuals.pdf) — explains required subjects, optional/alternative subjects, subject groups, and that English Language is selected by default as a required subject for all programmes.
- [JAMB FAQ](https://www.jamb.gov.ng/FAQ) — directs candidates to IBASS for institution- and course-specific UTME combinations.

## What is source-verified

The 2027 JAMB subject-option rows are checked against the live IBASS eligibility checker. This establishes that the subjects are selectable options in the checker; it does **not** establish any particular course combination.

Institution/course/year records in `upec_jamb_utme_combinations` are a separate data set. They must remain provisional until the exact institution, programme and applicable year have been checked in IBASS. Never infer a course combination from a department, faculty, another institution, or a generic subject list.

English Language is stored as the fixed compulsory subject and is not counted among the three remaining UTME subject slots.

## Database guard

The `upec_jamb_combination_subject_catalogue_guard` trigger checks that every required, alternative and subject-group option referenced by an active combination exists in the active JAMB catalogue for the same examination year. It rejects English Language being repeated among the remaining three subjects. A verified combination may only reference subject options whose catalogue rows are also source-verified.

Subject-group combinations are intentionally prevented from being marked verified until the admin verification workflow captures and compares group rules as well as required and alternative subjects. Such records remain provisional.

## Verification workflow

1. Select the applicable UTME year in the official IBASS checker.
2. Select the exact institution and programme.
3. Compare required subjects, optional/alternative subject count and list, and any subject-group rules.
4. Save the institution/course rule as provisional first.
5. Record verification only after the exact rule has been checked. Any edit invalidates previous verification and requires a fresh check.

Student-facing APIs expose only active, source-verified institution/course combinations. Admin APIs may show provisional records so they can be reviewed and completed.
