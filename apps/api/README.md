# UPEC API — Supabase migration

UPEC uses Supabase (PostgreSQL + Auth), **not MySQL**.

Configure the following in apps/api/.env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, OTP_SECRET, AUTH_PASSWORD_PEPPER and the required mail settings. Never expose the service-role key in either frontend. Run npm install and npm run dev in apps/api.

## Frontend API routing

The student website (port 3000), standalone admin app (port 3100), and Admin Desk (port 5174) call the backend through the same-origin /api path by default. Their Vite development servers proxy /api to http://localhost:4000. For deployments, configure the hosting reverse proxy to forward /api/* to the Express API, or set VITE_API_URL to the API origin at build time. If using a separate API origin, add the exact frontend origins to WEB_ORIGINS. Do not put SUPABASE_SERVICE_ROLE_KEY in VITE_* variables.

## Health checks

- GET /health checks that the Express process is running.
- GET /api/backend/status checks a real query against public.local_accounts through the server-side Supabase service-role client.
- Staff dashboard metrics and the student directory read from local_accounts, local_student_biodata and local_student_applications. The student directory intentionally includes registered accounts before they submit an application; application review actions remain unavailable until an application exists.
