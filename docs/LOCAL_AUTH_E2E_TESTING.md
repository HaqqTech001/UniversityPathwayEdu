# UPEC backend-owned authentication: end-to-end test

This branch uses Express for student login, signup, email OTP, recovery and student data access. Supabase PostgreSQL is used as a database; Supabase Auth is not used in the new student UI flows. Existing Supabase Auth accounts are **not automatically migrated**.

## Configuration

1. Create `apps/api/.env` locally using `apps/api/.env.example`.
2. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, OTP_SECRET and AUTH_PASSWORD_PEPPER. Each auth secret should be a separate cryptographically random value (at least 32 characters).
3. Set MAIL_PROVIDER=gmail, MAIL_FROM, GMAIL_USER and GMAIL_APP_PASSWORD using a Google App Password; do not commit credentials.
4. Set WEB_ORIGINS to the exact website origin(s). In production use HTTPS.
5. Set VITE_API_URL in the website deployment to the HTTPS Express API base URL. For local development, default is http://localhost:4000.

## Run locally

From the repository root:

```powershell
pnpm install
pnpm --dir apps/api dev
```

In a second PowerShell terminal:

```powershell
pnpm --dir apps/web dev
```

## Manual end-to-end checks

1. Register a NEW test email with a password of at least 10 characters. Expect a UPEC-branded six-digit OTP from Gmail.
2. Enter an incorrect OTP. Expect rejection. Enter the correct code within 10 minutes. Expect confirmation.
3. Sign in. Expect the student dashboard to load using the Express token, not Supabase Auth.
4. Complete biodata, refresh and confirm it persists.
5. Complete and submit an application; verify a reference number appears and survives refresh.
6. Sign out. Confirm student endpoints return HTTP 401 without a token.
7. Request password recovery, enter the emailed OTP and set a new password. Confirm old password fails and new password works.
8. Attempt wrong passwords, repeated OTPs and expired OTPs; ensure errors are handled and rate limits apply.
9. Check browser Network requests: student login should call /api/auth/login; no /auth/v1/signup or /auth/v1/token requests should occur.
10. Run `node --test apps/api/test/security.test.js` and `pnpm --dir apps/web build`.

## Current release blockers

- This work has not yet been built and tested against a running local deployment.
- Live Gmail delivery requires private SMTP credentials; these must never be pasted into GitHub or chat.
- Existing Supabase Auth users and historical profiles/applications need an explicit migration plan.
- The current Express JWT is short-lived and stored in sessionStorage; production requires a session/refresh strategy and password-reset session invalidation.
- Current API throttling is per process and not sufficient for multi-instance production. Use durable per-account/IP throttling and audit OTP concurrency before public release.
- Student dashboard and application flows need automated integration and browser E2E tests.
- The local feature branch must be reconciled carefully with main; preserve its unpublished commits and stashes.

Do not mark production-ready until these are resolved.
