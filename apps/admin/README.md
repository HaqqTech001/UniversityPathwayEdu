# University Pathway — Administration

Separate React/Vite application, intended for independent deployment from the public/student web app.

## Development

From this directory run `pnpm install` then `pnpm dev`; run `pnpm build` before deployment.

**Security:** This initial shell intentionally has no mock staff login, demo users or access to student data. Do not connect real student records until Supabase Auth, server-enforced staff roles, RLS and audit logging are implemented and tested. This shell is not a production-ready admin portal.

The existing `src/pages/StaffPortalPage.tsx` in the root app remains unchanged for now. Moving it and removing the public `/staff` routes are separate, gated migration steps.
