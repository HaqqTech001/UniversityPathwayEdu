# Legacy Operations Application

This is the legacy React/Vite staff workspace retained for compatibility with existing deployments and workflows. It is **not** the source of truth for new administration UI work.

## Official administration application

Use `apps/admin/` for all new staff/admin interface development. Its source tree is self-contained under `apps/admin/src/`; the admin application owns its sign-in UI and API client while using the shared staff API in `apps/api/`.

Do not add new admin pages or finance features here. Do not remove this legacy app until its deployment target, links, and any remaining consumers have been migrated and verified.

## Legacy development

Install dependencies with `npm install` in this directory, then run `npm run dev` (port 5174). Start the API in `apps/api` separately, with its required secrets and Supabase environment configuration.

Set `VITE_API_URL` to the API origin (defaults to `http://localhost:4000`). Set `VITE_PUBLIC_SITE_URL` for links to the public website, when used. Never expose API secrets in `VITE_` variables.

## Staff access and admissions

The legacy app uses the shared staff API. The API checks staff membership and permissions; student sessions do not provide staff access. Backend authorization remains authoritative even when a page is hidden in the frontend.

## Production readiness

Before retiring this application, verify that no production deployment, DNS route, redirect, scheduled workflow, or external link still depends on it. Do not treat an unverified frontend build or untested deployment as production-ready.
