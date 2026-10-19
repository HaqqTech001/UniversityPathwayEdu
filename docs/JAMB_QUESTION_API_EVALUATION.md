# UPEC Past Questions Provider Evaluation — 20 October 2026

## What is official?
JAMB's IBASS is an official source for syllabus and brochure information. No publicly documented, general-purpose official JAMB API supplying historical UTME questions **with worked solutions** was confirmed in this review. The JAMB vendor API is not evidence of such a question-bank licence.

## Third-party options
- **ALOC Station**: JAMB/UTME questions by subject/year, correct answers, and separately priced explanation capabilities. Documentation: https://www.aloc.com.ng/docs/questions and https://www.aloc.com.ng/docs/benchmarks. Terms: https://aloc.com.ng/terms. Commercial use requires suitable paid licensing; free sandbox has attribution and non-commercial restrictions. Secrets must remain on the backend.
- **SdashAPI**: UTME and other Nigerian exam question JSON, answers and explanation support, versions V1–V4. Docs: https://sdashapi.com/docs. Terms: https://www.sdashapi.com/Terms-of-Service. Confirm rights and costs for UPEC's use before production.

## Proposed architecture
Student portal -> UPEC backend -> licensed provider adapter -> normalized questions -> student practice / exam engine.

Do not expose the external API key in Vite or the browser. Distinguish (a) third-party historical questions, (b) tutor-authored questions, and (c) original practice questions. Do not label third-party questions as officially published/endorsed by JAMB unless documented rights exist.

Keep worked solutions visible only after an attempt is submitted for assessed practice; do not send answer keys to a client during secured timed examinations. Cache only if provider licence allows it. Always store question provenance, source exam year, attribution requirements, provider ID, and quality review state. Support corrections and reports for inaccurate answers.

## Verification before integration
1. Obtain licence confirmation for school/portal use, retention/caching, commercial access and branding.
2. Run sample requests across English, Mathematics, Chemistry, Physics, and Biology and multiple years; inspect explanation and image coverage.
3. Benchmark question quality and map subject aliases.
4. Check API limits, reliability and actual costs.
5. Implement provider adapter with environment-based keys and fallback to UPEC-owned question bank, not synthetic claims of official questions.
