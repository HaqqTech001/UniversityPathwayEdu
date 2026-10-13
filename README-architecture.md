# UPEC application separation

- `apps/web/`: target home for the public website and student portal. The existing Vite web application still runs from the repository root until migrated; this is **not yet a completed three-app monorepo**.
- `apps/admin/`: standalone Vite/React administration frontend. No mock staff login or access to student records.
- `apps/api/`: minimal Express service foundation with a health endpoint only. **No authentication, database, business endpoints, or authorisation implemented**.
- `packages/`: planned shared packages after boundaries are defined.

Run the existing web app from root with `npm run dev`. For the admin, install dependencies within `apps/admin` and run `npm run dev`. For the API, install dependencies within `apps/api` and run `npm run dev`.

Do not deploy the administrative workspace as a real staff system until server-side authentication, RBAC, data access controls, and security review are complete.
