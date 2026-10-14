# UPEC API — Supabase migration

UPEC uses Supabase (PostgreSQL + Auth), **not MySQL**.

Configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in apps/api/.env. Never expose the service-role key in the frontend. Run npm install and npm run dev in apps/api.

GET /health is the API health endpoint. GET /api/backend/status checks the Supabase table `upec_users` (this table is not yet provisioned).

**Migration in progress:** the previously added MySQL-based CBT routes are deliberately disabled. The old rooms.js remains in the repository but is not imported. Authentication, profiles, applications, payments and supervised CBT endpoints still need to be implemented against Supabase. Do not deploy as a complete backend.
