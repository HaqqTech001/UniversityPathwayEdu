# UPEC Operations Application

Independent React/Vite staff workspace for University Pathway Educational Consult. This is separate from the public website and student portal.

## Development

Install dependencies with `npm install` in this directory, then run `npm run dev` (port 5174). Start the API in `apps/api` separately, with its required secrets and Supabase environment configuration.

Set `VITE_API_URL` to the API origin (defaults to `http://localhost:4000`). Set `VITE_PUBLIC_SITE_URL` for links to the public website, when used. Never expose API secrets in `VITE_` variables.

## Staff access and admissions

Staff sign in through `POST /api/staff/auth/login`. The API checks staff membership and permissions; student sessions do not provide staff access.

- `GET /api/staff/me` — role and permissions.
- `GET /api/staff/applications` — up to 100 recent records; requires `applications.read`.
- `GET /api/staff/applications/metrics` — institution-wide exact counts by status; requires `applications.read`.
- `PATCH /api/staff/applications/:id/status` — review workflow with transactional audit logging; requires `applications.review`.
- `GET /api/staff/members` — read-only staff memberships; requires `staff.manage`.

The dashboard shows database-wide metrics separately from the 100-record review table. Status changes refresh both datasets.

## Production readiness

Before production rollout, configure secure secrets and mail delivery, apply and verify Supabase migrations/RPC permissions, test review transitions and authorization, and implement distributed rate limiting and account lockout for staff authentication. The current staff directory is intentionally read-only. Do not treat an unverified frontend build or untested deployment as production-ready.
