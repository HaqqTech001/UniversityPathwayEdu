# Phase 0 — Safe separation and Supabase foundation

Status: planning only. This document does not mean migration or backend integration is complete.

## Current repository findings
- Current app is a single Vite/React/TypeScript project at repository root.
- `src/App.tsx` routes public pages, student pages and `/staff*` into the same application bundle.
- `src/pages/StaffPortalPage.tsx` contains mock student records and client-side staff login UI. It is not a secure independent admin deployment.
- Preserve existing pages, assets, registration wizard, CBT work, design and route behavior during migration.

## Intended architecture
- `apps/web`: existing public website and student portal, deployed independently.
- `apps/admin`: separate React/TypeScript staff/admin portal with its own deployment and URL.
- `packages/types` and `packages/validation`: share only safe, framework-agnostic contracts.
- `supabase/migrations`: versioned PostgreSQL schema and RLS policies.
- `supabase/functions`: privileged server-side operations when required.
- Supabase Auth and private Storage; server-verified authorization for staff/admin.

## Migration sequence (one reversible change at a time)
1. Record baseline source inventory, lockfile, current build/lint outcomes and screenshots.
2. Create a dedicated migration branch based on main; do not commit directly to main.
3. Introduce pnpm workspace metadata without moving files; validate unchanged root app.
4. Move existing app into `apps/web` while preserving all assets, imports and routes; build and smoke-test.
5. Scaffold `apps/admin` separately; adapt existing staff UI only after visual comparison, retaining old source until parity is confirmed.
6. Replace public `/staff*` pages with safe navigation to the separate admin deployment; ensure public bundle no longer ships staff-only modules.
7. Add Supabase local configuration and migration scaffolding, no real credentials in git.
8. Implement Module 1 authentication end-to-end; remove browser-only/demo bypasses only when tested replacement exists.

## Security and deployment requirements
- Admin domain separation is not an authorization boundary. Enforce roles server-side and via RLS.
- Never ship service-role keys or other privileged secrets to browser bundles.
- Student self-access and staff access require independent policy tests.
- Auth verification, password reset and email delivery must work with real services.
- Protect private student files with storage policies and signed URLs.
- Configure backups and restoration tests before accepting production student data.
- CBT scoring, deadlines and final submission require server-side enforcement.
- Free-tier project pausing, email quotas and backup limitations must be reviewed before live launch.

## Gate for each step
- Existing web routes/screens retained.
- Typecheck/build/test pass; report any baseline failures separately.
- No real student data replaced with fabricated demo records.
- Both applications build independently before enabling separate deployments.
- Document changed files, tests run, blockers and rollback instructions.
- Obtain approval before proceeding to the next module.
