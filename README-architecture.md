# UPEC application architecture

## Application boundaries

- `apps/web/` — independently configured Vite/React public website and student portal. A full copy of the original source and public assets now exists here, with its own `package.json`.
- `apps/admin/` — independent Vite/React administration application with a separate entry point, dependencies and UI. Its modules are placeholders; staff authentication is not enabled.
- `apps/api/` — separate Express service foundation. Only `GET /health` exists. No database, authentication, permissions or business APIs have been implemented.
- `packages/` — future location for shared types and safe shared components; not created yet.

## Migration status

The original root-level website is intentionally retained for compatibility with the current deployment. **Production has not been switched to `apps/web/`.** Do not delete root files until the standalone web build and deployment have been tested. The old root `src/pages/StaffPortalPage.tsx` is a disabled legacy staff placeholder, not the administrative app.

## Local commands

From `apps/web/`: `npm install`, `npm run dev`, `npm run build`.

From `apps/admin/`: `npm install`, `npm run dev`, `npm run build`.

From `apps/api/`: `npm install`, `npm run dev`.

Run each app in its own terminal. There is not yet a root workspace orchestrator or a unified lockfile. Deploy each app separately after testing. Do not expose real student records or administrative actions without backend-enforced authentication and role-based authorization.
